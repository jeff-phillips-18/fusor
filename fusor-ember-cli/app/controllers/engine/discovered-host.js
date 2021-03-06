import Ember from 'ember';

export default Ember.Controller.extend({

  needs: ['deployment', 'hypervisor/discovered-host', 'rhev'],

  selectedRhevEngineHost: Ember.computed.alias("model"),
  rhevIsSelfHosted: Ember.computed.alias("controllers.deployment.model.rhev_is_self_hosted"),
  isStarted: Ember.computed.alias("controllers.deployment.isStarted"),
  isNotStarted: Ember.computed.alias("controllers.deployment.isNotStarted"),

  hypervisorModelIds: function() {
    return this.get('controllers.deployment.model.discovered_hosts').getEach('id');
  }.property('controllers.deployment.model.discovered_hosts.[]'),

  engineNextRouteName: function() {
    if (this.get('rhevIsSelfHosted')) {
      return 'rhev-options';
    } else {
      return 'hypervisor.discovered-host';
    }
  }.property('rhevIsSelfHosted'),

  // Filter out hosts selected as Hypervisor
  availableHosts: function() {
    // TODO: Ember.computed.filter() caused problems. error item.get is not a function
    var self = this;
     var allDiscoveredHosts = this.get('allDiscoveredHosts');
     if (this.get('allDiscoveredHosts')) {
        return allDiscoveredHosts.filter(function(item) {
          if (self.get('hypervisorModelIds')) {
            //console.log(item.get('id'));
            //console.log(self.get('hypervisorModelIds'));
            return !(self.get('hypervisorModelIds').contains(item.get('id')));
          }
        });
      }
  }.property('allDiscoveredHosts.[]', 'hypervisorModelIds.[]'),

  // same as Engine. TODO. put it mixin
  filteredHosts: function(){
    var searchString = this.get('searchString');
    var rx = new RegExp(searchString, 'gi');
    var availableHosts = this.get('availableHosts');

    if (this.get('isStarted')) {
      return Ember.A([this.get('model')]);
    } else if (availableHosts.get('length') > 0) {
      return availableHosts.filter(function(record) {
        return (record.get('name').match(rx) || record.get('memory_human_size').match(rx) ||
                record.get('disks_human_size').match(rx) || record.get('subnet_to_s').match(rx) ||
                record.get('mac').match(rx)
               );
      });
    } else {
      return availableHosts;
    }
  }.property('availableHosts.[]', 'searchString', 'isStarted'),

  numSelected: function() {
    return (this.get('model.id')) ? 1 : 0;
  }.property('model.id'),

  actions: {
    setEngine: function(host) {
      var deployment = this.get('controllers.deployment');
      deployment.set('model.discovered_host', host);
    }
  }

});
