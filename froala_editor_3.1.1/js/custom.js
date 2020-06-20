// Define popup template.
Object.assign(FroalaEditor.POPUP_TEMPLATES, {
  'customPlugin.popup': '[_BUTTONS_][_CUSTOM_LAYER_]'
});

// Define popup buttons.
Object.assign(FroalaEditor.DEFAULTS, {
  popupButtons: ['popupClose', '|', 'popupButton1', 'popupButton2'],
});

// The custom popup is defined inside a plugin (new or existing).
FroalaEditor.PLUGINS.customPlugin = function (editor) {
  // Create custom popup.
  function initPopup () {
    // Load popup template.
    var template = FroalaEditor.POPUP_TEMPLATES.customPopup;
    if (typeof template == 'function') template = template.apply(editor);

    // Popup buttons.
    var popup_buttons = '';

    // Create the list of buttons.
    if (editor.opts.popupButtons.length > 1) {
      popup_buttons += '<div class="fr-buttons">';
      popup_buttons += editor.button.buildList(editor.opts.popupButtons);
      popup_buttons += '</div>';
    }

    // Load popup template.
    var template = {
      buttons: popup_buttons,
      custom_layer: '<div class="custom-layer">Hello World!</div>'
    };

    // Create popup.
    var $popup = editor.popups.create('customPlugin.popup', template);

    return $popup;
  }

  // Show the popup
  function showPopup () {
    // Get the popup object defined above.
    var $popup = editor.popups.get('customPlugin.popup');

    // If popup doesn't exist then create it.
    // To improve performance it is best to create the popup when it is first needed
    // and not when the editor is initialized.
    if (!$popup) $popup = initPopup();

    // Set the editor toolbar as the popup's container.
    editor.popups.setContainer('customPlugin.popup', editor.$tb);

    // If the editor is not displayed when a toolbar button is pressed, then set BODY as the popup's container.
    // editor.popups.setContainer('customPlugin.popup', $('body'));

    // Trigger refresh for the popup.
    // editor.popups.refresh('customPlugin.popup');

    // This custom popup is opened by pressing a button from the editor's toolbar.
    // Get the button's object in order to place the popup relative to it.
    var $btn = editor.$tb.find('.fr-command[data-cmd="myButton"]');

    // Compute the popup's position.
    var left = $btn.offset().left + $btn.outerWidth() / 2;
    var top = $btn.offset().top + (editor.opts.toolbarBottom ? 10 : $btn.outerHeight() - 10);

    // Show the custom popup.
    // The button's outerHeight is required in case the popup needs to be displayed above it.
    editor.popups.show('customPlugin.popup', left, top, $btn.outerHeight());
  }

  // Hide the custom popup.
  function hidePopup () {
    editor.popups.hide('customPlugin.popup');
  }

  // Methods visible outside the plugin.
  return {
    showPopup: showPopup,
    hidePopup: hidePopup
  }
}

// Define an icon and command for the button that opens the custom popup.
FroalaEditor.DefineIcon('buttonIcon', { NAME: 'star'})
FroalaEditor.RegisterCommand('myButton', {
  title: 'Show Popup',
  icon: 'buttonIcon',
  undo: false,
  focus: false,
  popup: true,
  // Buttons which are included in the editor toolbar should have the plugin property set.
  plugin: 'customPlugin',
  callback: function () {
    if (!this.popups.isVisible('customPlugin.popup')) {
      this.customPlugin.showPopup();
    }
    else {
      if (this.$el.find('.fr-marker')) {
        this.events.disableBlur();
        this.selection.restore();
      }
      this.popups.hide('customPlugin.popup');
    }
  }
});

// Define custom popup close button icon and command.
FroalaEditor.DefineIcon('popupClose', { NAME: 'times' });
FroalaEditor.RegisterCommand('popupClose', {
  title: 'Close',
  undo: false,
  focus: false,
  callback: function () {
    this.customPlugin.hidePopup();
  }
});

// Define custom popup 1.
FroalaEditor.DefineIcon('popupButton1', { NAME: 'bell-o' });
FroalaEditor.RegisterCommand('popupButton1', {
  title: 'Button 1',
  undo: false,
  focus: false,
  callback: function () {
    alert("popupButton1 was pressed");
  }
});

// Define custom popup 2.
FroalaEditor.DefineIcon('popupButton2', { NAME: 'bullhorn' });
FroalaEditor.RegisterCommand('popupButton2', {
  title: 'Button 2',
  undo: false,
  focus: false,
  callback: function () {
    alert("popupButton2");
  }
});