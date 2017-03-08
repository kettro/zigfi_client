$(() => {
  // Add Markup
  var _preload_markup__bool_els = $('.device-control_widget_boolean');
  for(var i = 0; i < _preload_markup__bool_els.length; i++){
    var el = $(_preload_markup__bool_els[i]);
    var control_el = el.closest('.device-control_widget_data-block');
    var control_val = JSON.parse(control_el.attr('data-control'));
    if(control_val.type == 'boolean'){
      el.text((control_val.value ? 'ON' : 'OFF'));
    }
  }

  var _preload_markup__grad_els = $('.device-control_widget_gradient');
  for(var i = 0; i < _preload_markup__grad_els.length; i++){
    var el = $(_preload_markup__grad_els[i]);
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

  var _preload_markup__status_els = $('.device-control_widget_status');
  for(var i = 0; i < _preload_markup__status_els.length; i++){
    var el = $(_preload_markup__status_els[i]);
    var control_val = JSON.parse(el.attr('data-control'));
    if(control_val.type == 'status'){
      el.text(control_val.value);
    }
  };
  // add Event Listeners
  $('.device-control_widget_refresh-block').on("click", (ev) => {
    ev.stopPropagation();
    var element = $(ev.target);
    // Get the control data from the DOM
    var data_block = element.closest('.device-control_widget').find(".device-control_widget_data-block");
    var control = JSON.parse(data_block.attr('data-control'));

    // Post to the server
    var device = element.closest('.device-block').attr('data-devicename');
    var group = element.closest('.group-block').attr('data-groupname');
    var topic_path = [group,device].join('/');

    $.ajax({
      url: "/dashboard",
      data: {
        cmd: "read_data",
        topic: topic_path,
        payload: control
      },
      type: "POST",
      dataType: "json"
    }).done((res) => {
      // add in the function to execute after the JSON is returned
      return console.log(res);
    });
  });

  $('.device-control_widget_boolean').on("click", (ev) => {
    ev.stopPropagation();
    var element = $(ev.target); // aka, the textbox
    var old_ctrl = JSON.parse(element.attr('data-control'));
    // get the value currently displayed
    var curr_text = element.text();
    var new_text = (old_ctrl.value) ? 'OFF' : 'ON';
    var new_ctrl = {
      type: old_ctrl.type,
      value: new_text
    };
    element.attr('data-control', JSON.stringify(new_ctrl));
    element.text(new_text.toString());
    // Post to the Server
    deviceControlWidget_updateDataPost(element, new_ctrl, (res) => {
      console.log(res);
    });
  });

  $('.group-block_expando').on('click', (ev) => {
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

function deviceControlWidget_updateDataPost(el, control, callback){
  var device = el.closest('.device-block').attr('data-devicename');
  var group = el.closest('.group-block').attr('data-groupname');
  var topic_path = [group,device].join('/');

  $.ajax({
    url: "/dashboard",
    data: {
      cmd: "update_data",
      topic: topic_path,
      payload: control
    },
    type: "POST",
    dataType: "json"
  }).done((res) => {
    // add in the function to execute after the JSON is returned
    return callback(res);
  });
}
