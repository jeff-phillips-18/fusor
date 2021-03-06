import Ember from 'ember';
import DeploymentRouteMixin from "../mixins/deployment-route-mixin";

export default Ember.Route.extend(DeploymentRouteMixin, {

  model: function () {
      var deploymentId = this.modelFor('deployment').get('id');
      return Ember.RSVP.hash({
          plan: this.store.find('deployment-plan', deploymentId),
          images: this.store.find('image', {deployment_id: deploymentId}),
          nodes: this.store.find('node', {deployment_id: deploymentId}),
          profiles: this.store.find('flavor', {deployment_id: deploymentId}),
      });
  },

  setupController: function(controller, model) {
    controller.set('model', model);
  }
});
