import Ember from 'ember';

export default Ember.Route.extend({

  setupController: function(controller, model) {
    controller.set('model', model);
    controller.set('showErrorMessage', false);

    // check if org has upstream UUID using Katello V2 API
    var orgID = this.modelFor('deployment').get('organization.id');
    var url = '/katello/api/v2/organizations/' + orgID;
    Ember.$.getJSON(url).then(function(results) {
      if (Ember.isPresent(results.owner_details.upstreamConsumer)) {
        controller.set('organizationUpstreamConsumerUUID', results.owner_details.upstreamConsumer.uuid);
        controller.set('organizationUpstreamConsumerName', results.owner_details.upstreamConsumer.name);
        // if no UUID for deployment, assign it from org UUID
        if (Ember.isBlank(controller.get('model.upstream_consumer_uuid'))) {
          controller.set('upstreamConsumerUuid', results.owner_details.upstreamConsumer.uuid);
          controller.set('upstreamConsumerName', results.owner_details.upstreamConsumer.name);
        }
      } else {
        controller.set('organizationUpstreamConsumerUUID', null);
        controller.set('organizationUpstreamConsumerName', null);
      }
    });

    if (model.get('isAuthenticated')) {
      // verify isAuthenticated: true is accurate, since Satellite session may have changed.
      var urlVerify = '/customer_portal/users/' + model.get('identification') + "/owners";
      Ember.$.getJSON(urlVerify).then(function(results) {
        //do nothing
      }, function(results) {
        model.set('isAuthenticated', false);
        model.save();
      });
    }

  },

  deactivate: function() {
    return this.send('saveDeployment', null);
  },

  actions: {
    error: function(reason, transition) {
      // bubble up this error event:
      return true;
    },

  loginPortal: function() {
      var self = this;
      var controller = this.controllerFor('subscriptions/credentials');
      var identification = controller.get('model.identification');
      var password = controller.get('password');
      var token = Ember.$('meta[name="csrf-token"]').attr('content');
      controller.set('nextButtonTitle', "Logging in ...");
      controller.set('disableCredentialsNext', true);
      return new Ember.RSVP.Promise(function (resolve, reject) {
        Ember.$.ajax({
            url: '/customer_portal/login/',
            type: "POST",
            data: JSON.stringify({username: identification, password: password}),
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "X-CSRF-Token": token,
            },
            success: function(response) {
              //show always be {} empty successful 200 response
              self.send('saveCredentials');
            },
            error: function(response){
              console.log('error on loginPortal');
              controller.set('nextButtonTitle', "Next");
              controller.set('disableCredentialsNext', false);
              return self.send('error');
            }
        });
      });
    },

    logoutPortal: function() {
      var self = this;
      var token = Ember.$('meta[name="csrf-token"]').attr('content');

      return new Ember.RSVP.Promise(function (resolve, reject) {
        Ember.$.ajax({
            url: '/customer_portal/logout/',
            type: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "X-CSRF-Token": token,
            },
            success: function(response) {
              //show always be {} empty successful 200 response
              self.modelFor('subscriptions').setProperties({'isAuthenticated': false,
                                               'identification': null,
                                               'ownerKey': null,
                                               'consumerUUID': null});
              self.modelFor('subscriptions').save();
            },
            error: function(response){
              console.log('error on loginPortal');
              return self.send('error');
            }
        });
      });
    },

    saveCredentials: function() {
      var self = this;
      var controller = this.controllerFor('subscriptions/credentials');
      var identification = controller.get('model.identification');
      var sessionPortal = this.modelFor('subscriptions');
      if (sessionPortal) {
        sessionPortal.set('identification', identification);
      } else {
        sessionPortal = self.store.createRecord('session-portal', {identification: identification});
      }
      sessionPortal.save().then(function(result) {
          console.log('saved session-portal');
          controller.set('showErrorMessage',false);
          return self.send('authenticatePortal');
      }, function(response) {
          console.log('error saving session-portal');
          controller.set('nextButtonTitle', "Next");
          controller.set('disableCredentialsNext', false);
          return self.send('error');
      });
    },

    authenticatePortal: function() {

      var controller = this.controllerFor('subscriptions/credentials');
      var identification = controller.get('model.identification');
      var token = Ember.$('meta[name="csrf-token"]').attr('content');
      var self = this;
      var url = '/customer_portal/users/' + identification + "/owners";

      return new Ember.RSVP.Promise(function (resolve, reject) {
        Ember.$.ajax({
            url: url,
            type: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "X-CSRF-Token": token,
            },

            success: function(response) {
              var ownerKey = response[0]['key'];
              console.log('owner key is ' + ownerKey);
              var sessionPortal = self.modelFor('subscriptions');
              sessionPortal.set('ownerKey', ownerKey);
              sessionPortal.set('isAuthenticated', true);
              sessionPortal.save().then(function(result) {
                  console.log('saved ownerKey in session-portal');
                  controller.set('nextButtonTitle', "Next");
                  controller.set('disableCredentialsNext', false);
                  return self.transitionTo('subscriptions.management-application');
              }, function(response) {
                  controller.set('nextButtonTitle', "Next");
                  controller.set('disableCredentialsNext', false);
                  console.log('error saving ownerKey session-portal');
              });
            },

            error: function(response){
                console.log('error on authenticatePortal');
                controller.set('nextButtonTitle', "Next");
                controller.set('disableCredentialsNext', false);
                controller.setProperties({'showErrorMessage': true,
                                          'errorMsg': 'Your username or password is incorrect. Please try again.'
                                          });
            }
        });
      });

    },

    redirectToManagementApplication: function() {
      return this.transitionTo('subscriptions.management-application');
    }

  }

});
