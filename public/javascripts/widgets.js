$(() => {
  // Add Markup
  _premarkup_grad_($('.device-control_widget_gradient'));
  _premarkup_bool_($('.device-control_widget_boolean'));
  _premarkup_status_($('.device-control_widget_status'));
  // Deferred computation
  $.ajax({
    url: '/dashboard/connman',
    type: 'POST',
  }).done((result) => {
    $('.content_block').append(result.elements_html);
  });
  // add Event Listeners
  var root_el = $('.content-block');
  // The Refresh block
  root_el.on('click', '.device-control_widget_refresh-block', (ev) => {
    ev.stopPropagation();
    var element = $(ev.target);
    // Get the control data from the DOM
    var data_block = element.closest('.device-control_widget').find(".device-control_widget_data-block");
    var control = JSON.parse(data_block.attr('data-control'));

    // Post to the server
    var device = element.closest('.device-block').attr('data-devicename');
    var group = element.closest('.group-block').attr('data-groupname');
    var topic_path = [group,device].join('/');
    var ajax_data = {
      cmd: "read_devdata",
      topic: topic_path,
      payload: JSON.stringify({
        grp_name: group,
        dev_name: device,
        ctrl_name: control
      })
    };

    $.ajax({
      url: "/dashboard",
      data: ajax_data,
      type: "POST",
      dataType: "json"
    }).done((res) => {
      // add in the function to execute after the JSON is returned
      return console.log(res);
    });
  });

  // Boolean Control
  root_el.on('click', '.device-control_widget_boolean', (ev) => {
    ev.stopPropagation();
    var element = $(ev.target); // aka, the textbox
    var old_ctrl = JSON.parse(element.attr('data-control'));
    // get the value currently displayed
    var curr_text = element.text();
    var new_text = (old_ctrl.value) ? 'OFF' : 'ON';
    var new_ctrl = {
      name: old_ctrl.name,
      type: old_ctrl.type,
      value: (new_text == 'ON')
    };
    element.attr('data-control', JSON.stringify(new_ctrl));
    element.text(new_text.toString());
    // Post to the Server
    deviceControlWidget_updateDataPost(element, new_ctrl, (res) => {
      console.log(res);
    });
  });

  // Group block expando
  root_el.on('click', '.group-block_expando', (ev) => {
    var el = $(ev.target); // == to the image
    var group_block = el.closest('.group-block');
    var device_block = group_block.find('.device-block');
    if(device_block.hasClass('hidden')){
      // The expando is down, and is closed
      device_block.removeClass('hidden');
      el.attr('src', '/images/expando_close_arrow.svg');
    }else{
      // The expando is yet to be closed
      device_block.addClass('hidden');
      el.attr('src', 'images/expando_open_arrow.svg');
    }
  });
});

// External functions

// Gradient onChange listener
function deviceControlWidget_gradientSliderOnChange(tag){
  var el = $(tag);
  var val_span = el.siblings('span.device-control_widget_gradient-value');
  var data_block = el.closest('.device-control_widget_data-block');
  var old_ctrl = JSON.parse(data_block.attr('data-control'));
  var new_ctrl = {
    name: old_ctrl.name,
    type: old_ctrl.type,
    value: parseInt(tag.value)
  };
  // Update the data-control tag in the data-block, and the displayed value
  data_block.attr('data-control', JSON.stringify(new_ctrl));
  val_span.text(tag.value);
  // Post to server
  deviceControlWidget_updateDataPost(el, new_ctrl,(res) => {
    console.log(res);
  });
}

// update_devdata request builder
function deviceControlWidget_updateDataPost(el, control, callback){
  var device = el.closest('.device-block').attr('data-devicename');
  var group = el.closest('.group-block').attr('data-groupname');
  var topic_path = [group,device].join('/');
  var data = {
    cmd: "update_devdata",
    payload: JSON.stringify({
      grp_name: group,
      dev_name: device,
      ctrl_name: control.name,
      type: control.type,
      value: control.value
    })
  };
  console.log(data);

  $.ajax({
    url: "/dashboard",
    data: data,
    type: "POST",
    dataType: "json"
  }).done((res) => {
    // add in the function to execute after the JSON is returned
    return callback(res);
  });
}

function _premarkup_grad_(els){
  for(var i = 0; i < els.length; i++){
    var el = $(els[i]);
    var control_el = el.closest('.device-control_widget_data-block');
    var control_val = JSON.parse(control_el.attr('data-control'));
    var input_span = $('<span>', {
      'class': 'device-control_widget_gradient-value'
    });

    var input_slider = $('<input>', {
      'class': 'device-control_widget_gradient-slider',
      'type': 'range',
      'step': 1,
      'min': 0,
      'max': 10,
      'value': control_val.value,
      'onchange': "deviceControlWidget_gradientSliderOnChange(this)"
    });
    input_span.text(control_val.value);
    control_el.append(input_span);
    control_el.append(input_slider);
  }
}

function _premarkup_bool_(els){
  for(var i = 0; i < els.length; i++){
    var el = $(els[i]);
    var control_el = el.closest('.device-control_widget_data-block');
    var control_val = JSON.parse(control_el.attr('data-control'));
    if(control_val.type == 'boolean'){
      el.text((control_val.value ? 'ON' : 'OFF'));
    }
  }
}

function _premarkup_status_(els){
  for(var i = 0; i < els.length; i++){
    var el = $(els[i]);
    var control_val = JSON.parse(el.attr('data-control'));
    if(control_val.type == 'status'){
      el.text(control_val.value);
    }
  };
}
