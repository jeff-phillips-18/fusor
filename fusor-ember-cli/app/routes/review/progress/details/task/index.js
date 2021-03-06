import Ember from 'ember';

export default Ember.Route.extend({

  model: function() {
    var deployment = this.modelFor('deployment');
    return this.store.find('foreman-task', deployment.get('foreman_task_uuid'));
  }

});
