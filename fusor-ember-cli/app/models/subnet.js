import DS from 'ember-data';

var Subnet = DS.Model.extend({
  network: DS.attr('string'),
  mask: DS.attr('string'),
  priority: DS.attr('number'),
  name: DS.attr('string'),
  vlanid: DS.attr('string'),
  created_at: DS.attr('date'),
  updated_at: DS.attr('date'),
  dhcp_id: DS.attr('number'),
  tftp_id: DS.attr('number'),
  from: DS.attr('string'),
  to: DS.attr('string'),
  gateway: DS.attr('string'),
  dns_primary: DS.attr('string'),
  dns_secondary: DS.attr('string'),
  dns_id: DS.attr('number'),
  sort_network_id: DS.attr('number'),
  boot_mode: DS.attr('string'),
  ipam: DS.attr('string'),
  trafficTypes: DS.hasMany('trafficType',{ async: true })
});

Subnet.reopenClass({
    FIXTURES: [
        {
          id: 7,
          network: '10.35.115.0',
          mask: '255.255.255.0',
          priority: '',
          name: 'ForemanSubnetUC',
          vlanid: '',
          dhcp_id: '',
          tftp_id: '',
          from: '',
          to: '',
          gateway: '',
          dns_primary: '',
          dns_secondary: '',
          boot_mode: 'DHCP',
          ipam: 'DHCP',
          trafficTypes: []
       },
       {
          id: 1,
          network: '10.35.27.0',
          mask: '255.255.255.192',
          priority: '',
          name: 'SAT Lab 180',
          vlanid: '',
          dhcp_id: '',
          tftp_id: '',
          from: '',
          to: '',
          gateway: '',
          dns_primary: '',
          dns_secondary: '',
          boot_mode: 'DHCP',
          ipam: 'DHCP',
          trafficTypes: [],
       },
       {
          id: 4,
          network: '10.35.64.0',
          mask: '255.255.255.0',
          priority: '',
          name: 'QA-Default',
          vlanid: '',
          dhcp_id: '',
          tftp_id: '',
          from: '',
          to: '',
          gateway: '10.35.27.62',
          dns_primary: '',
          dns_secondary: '',
          boot_mode: 'DHCP',
          ipam: 'Static',
          trafficTypes: [],
       },
       {
          id: 9,
          network: '10.35.27.128',
          mask: '255.255.255.192',
          priority: '',
          name: 'SatLab 182',
          vlanid: '',
          dhcp_id: '',
          tftp_id: '',
          from: '',
          to: '',
          gateway: '10.35.27.190',
          dns_primary: '',
          dns_secondary: '',
          boot_mode: 'DHCP',
          ipam: 'Static',
          trafficTypes: [],
       }

  ]
});

export default Subnet;