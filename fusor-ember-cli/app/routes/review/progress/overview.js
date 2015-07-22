import Ember from 'ember';

export default Ember.Route.extend({
  model: function () {
      var deployment = this.modelFor('deployment');
      var deployTaskPromise = this.store.find('foreman-task', deployment.get('foreman_task_uuid'));
      var subtasksOfDeployPromise = this.store.find('foreman-task', {search: "parent_task_id = " + deployment.get('foreman_task_uuid')});
      var self = this;

      return Ember.RSVP.Promise.all([deployTaskPromise, subtasksOfDeployPromise]).then(function(results) {
        var deployTask = results[0];
        var subtasksOfDeploy = results[1];
        var manageContentTask = subtasksOfDeploy.findBy('humanized_name', 'Manage Content');
        var rhevTask          = subtasksOfDeploy.findBy('humanized_name', 'Deploy Red Hat Enterprise Virtualization');
        var cfmeTask          = subtasksOfDeploy.findBy('humanized_name', 'Deploy CloudForms Management Engine');

        return Ember.RSVP.hash({
           deployTask: deployTask,
           manageContentTask: manageContentTask,
           rhevTask: rhevTask,
           cfmeTask: cfmeTask,
           openstackDeployment: this.store.find('openstack-deployment', 'overcloud'),
           openstackPlan: this.store.find('deployment-plan', 'overcloud'),
           openstackNodes: this.store.find('node')
        });

      });
  },

  setupController: function(controller, model) {
    controller.set('model', model);
    controller.startPolling();
  },

  deactivate: function() {
    this.get('controller').stopPolling();
  },

  actions: {
    refreshModelOnOverviewRoute: function(){
      return this.refresh();
    }
  }

});
