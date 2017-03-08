// Client side JS to provide functionality to the Hamburger menu and its derivatives
$(() => {
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
    console.log("We should add a device");
  });

  $('.options-bar_widget_remove-device').on('click', (ev) => {
    console.log("we should remove a device");
  });

  $('.options-bar_widget_edit-server').on('click', (ev) => {
    console.log("The Server should be edited");
  });

});
