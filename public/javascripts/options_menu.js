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

  modal_background.on('click', (ev) => {
    modal_background.fadeOut(() => {
      modal_background.addClass('hidden');
      modal_background.css("display", "");
    })
  });

  // Modal Listeners; dynamically generated
  modal_root.on('click', '.dynamic_selector', 'data', (ev) => {
    // ensure to always stop propogation
  });

});
