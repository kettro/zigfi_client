// Client side JS to provide functionality to the Hamburger menu and its derivatives
$(() => {
  var modal_root = $('.options-modal_interface');
  var modal_background= $('.options-modal-block');

  $('.nav-title-burger-block').on('click', (ev) => {
    var opt_bar_height = $('.options-bar').height();
    if(opt_bar_height == 0){
      $('.options-bar').height("150px");
    }else {
      $('.options-bar').height("0px");
    }
  });

  $('.options-bar_widget_add-device').on('click', (ev) => {
    // launch a modal
    // Modal to give options on adding a device
    $('.options-bar').height("0px");
    // Only add the data if it is yet unknown
    if($('.options-modal_add-block').length == 0){
      $.ajax({
        url: "/dashboard/add",
        type: "GET",
        dataType: "json"
      }).done((res) => {
        // add in the function to execute after the JSON is returned
        var add_modal_interface = res.modal;
        modal_root.append(add_modal_interface);
        modal_background.removeClass('hidden');
      });
    }else{
      modal_background.removeClass('hidden');
    }
  });

  $('.options-bar_widget_remove-device').on('click', (ev) => {
    console.log("we should remove a device");
  });

  $('.options-bar_widget_edit-server').on('click', (ev) => {
    console.log("The Server should be edited");
  });


  // Modal Listeners; dynamically generated
  modal_background.on('click', (ev) => {
    modal_background.fadeOut(() => {
      modal_background.addClass('hidden');
      modal_background.css("display", "");
    })
  });
  // Stop all propagation if click is on the modal window itself, not the background
  modal_root.on('click', (ev) => {
    ev.stopPropagation();
  });

  modal_root.on('click', '.expando_img', (ev) => {
    ev.stopPropagation();
    var el = $(ev.target); // == to the image
    var expando_block = el.closest('.options-modal_expando');
    // Get the block to minimize = parent's parent
    var parent_block = expando_block.parent().parent();
    var minimizing_block = parent_block.find('div:eq(2)');
    if(minimizing_block.hasClass('hidden')){
      // The expando is down, and is closed
      minimizing_block.removeClass('hidden');
      el.attr('src', '/images/expando_close_arrow.svg');
    }else{
      // The expando is yet to be closed
      minimizing_block.addClass('hidden');
      el.attr('src', 'images/expando_open_arrow.svg');
    }
  });

  // Select Controls
  modal_root.on('click', '.modal_devices_controls', (ev) => {
    // select controls
    var el = $(ev.target);
    var selected = el.attr('data-selected');
    if(selected == 't'){
      // set off
      el.css('background-color', '#ffffff');
      el.attr('data-selected', 'f');
    }else{
      // set on
      el.css('background-color', '#cfe2f3'); // the light blue
      el.attr('data-selected', 't');
    }
  });

  // Confirm the adding of a group
  modal_root.on('click', '.options-modal_groups-add-name-confirm', (ev) => {
    // send out create_grp AJAX call to server
    var el = $(ev.target);
    var group_name = el.prev().val();
    var create_grp = {
      cmd: "create_grp",
      payload: JSON.stringify({
        grp_name: group_name
      })
    }
    $.ajax({
        url: "/dashboard/add",
        type: "POST",
        data: create_grp,
        dataType: "json"
    }).done((res) => {
      console.log(res);
    });
  });

  modal_root.on('click', '.modal_devices_ok-button', (ev) => {
    var el = $(ev.target);
    // Section 1: Get the info from the form
    var root = el.closest('.options-modal_devices-add-new-block');
    // get id
    var id_block = root.find('.modal_devices_id-block');
    var id = id_block.text().split(' = ')[1];
    // Get group name
    var groups_select = root.find('.modal_devices_group_select-el');
    if(groups_select.val() == '__title'){ return; } // __title == "select a group"
    var group = groups_select.val();
    // get device name
    var device_name_field = root.find('.options-modal_devices-add-name');
    var device = device_name_field.val();
    // get the controls to be added
    var controls_selections = root.find('.modal_devices_controls-block').children();
    var selected_control_array = [];
    controls_selections.each((index, obj) => {
      var controls = $(obj);
      var selected = controls.attr('data-selected');
      var type;
      if(selected == 't'){
        var name = controls.text();
        if(name == 'ON/OFF'){ type = "boolean"; }
        else if(name == 'Gradient'){ type = 'gradient'; }
        else if(name == 'Status'){ type = 'status'; }
        var curr = {
          name: name,
          type: type
        };
        selected_control_array.push(curr);
      }
    });

    // Section 2: Send off to the Server
    var payload = {
      dev_name: device,
      grp_name: group,
      dev_id: id,
      controls: selected_control_array
    };
    var create_dev = {
      cmd: "create_dev",
      payload: JSON.stringify(payload)
    };
    //var create_dev = JSON.stringify({
    //  cmd: "create_dev",
    //  payload: payload
    //});

    $.ajax({
        url: "/dashboard/add",
        type: "POST",
        data: create_dev,
        dataType: "json"
    }).done((result) => {
      console.log(result);
      // need to remove it from the list of unconns, and add it to the list of connected devices
      // if(result.response.valid != 0){ // we are bad
      // Remove from current view
      root.remove(); // kill the root node of this device
      // Add to connected list
      var group_block = {};
      var group_name = result.response.grp_name;
      var device_name = result.response.dev_name;
      $('.group-block').each((index, element) => {
        var el = $(element);
        if(el.attr('data-groupName') == group_name){
          group_block = el;
          return;
        }
      });
      if(group_block == {}){
        // empty group_block...
      }else{
        var dev_block = $('<div>', {
          "class": "device-block",
          "data-deviceName": device_name
        });
        // build up the dev block
        var dev_block_text = $('<div>', {
          "class": "device-block_text",
        });
        dev_block_text.text(device_name);
        dev_block.append(dev_block_text);
        console.log(dev_block);
        var device_control_block = $('<div>', {
          "class": "device-control-block"
        });
        // per control initialized:
        $.each(result.response.controls, (index, obj) => {
          var controlType = 'device-control_widget_' + obj.type;
          var device_control_widget = $('<div>', {
            "class": "device-control_widget"
          });
          // Name block
          var device_control_widget_name_block = $('<div>', {
            "class": "device-control_widget_name-block"
          }).append($('<span>', {
            "class": "device-control_widget_name_text"
          }).text(obj.name));
          device_control_widget.append(device_control_widget_name_block);
          if(obj.value == null){
            if(obj.type == 'boolean'){
              obj.value = true;
            }else if(obj.type == 'gradient'){
              obj.value = 0;
            }else if(obj.type == 'status'){
              obj.value = 0;
            }
          }
          // Data block
          var device_control_widget_data_block = $('<div>', {
            "class": controlType + " device-control_widget_data-block",
            "data-control": JSON.stringify({
              name: obj.name,
              type: obj.type,
              value: obj.value
            })
          });
          // functions from widgets.js, used for premarkup and setting the values
          if(obj.type == 'boolean'){
            _premarkup_bool_(device_control_widget_data_block);
          }else if(obj.type == 'gradient'){
            _premarkup_grad_(device_control_widget_data_block);
          }else if(obj.type == 'status'){
            _premarkup_status_(device_control_widget_data_block);
          }
          device_control_widget.append(device_control_widget_data_block);
          device_control_block.append(device_control_widget);

          // Refresh block
          var device_control_widget_refresh_block = $('<div>', {
            "class": "device-control_widget_refresh-block"
          }).append($('<img>', {
            "class": "device_control_widget_refresh-image",
            "src": "/images/refresh_image_48x48px.svg"
          }));
          device_control_widget.append(device_control_widget_refresh_block);
          dev_block.append(device_control_block);
          console.log(dev_block);
        });
        group_block.append(dev_block);
      }
      // it should be the array of all groups
    });
  });

  modal_root.on('click', '.options-modal_close-window', (ev) => {
    // close the window
    modal_background.fadeOut(() => {
      modal_background.addClass('hidden');
      modal_background.css("display", "");
    })
  });

});
