// stereolabels.js v1.0, 2007-08-15
//
// Copyright (c) 2007 Stereo :: Interactive & Design (http://blog.stereodevelopment.com)
// Author: Scott Meves 
//
// Based on:
//  labels.js by aaron boodman || www.youngpup.net
// 
// stereotabs.js freely distributable under the terms of an MIT-style license.

var stereolabels = Class.create();

stereolabels.prototype = {
  labels: [],

  initialize: function(options) {
    this.options = Object.extend({
			className : 'inside'
		}, options || {});
		
    this.labels = $$('label.'+this.options.className);
    $A(this.labels).each(function(label) {
      this.initLabel(label);
    }.bind(this));
    
    $A(document.forms).each(function(form) {
      Event.observe(form, "submit", function() { this.uninit() }.bind(this))
    }.bind(this));
  },

  // called on form submit
  // - clear all labels so they don't accidentally get submitted to the server
  // - WOULD CAUSE BUG IF FIELD CONTENTS WAS IN FACT MEANT TO EQUAL LABEL VALUE
  uninit: function() {
    $A(this.labels).each(function(label) {
      var el = $(label.htmlFor);
      if (el && el.value == el._labeltext) this.hide(el)
    }.bind(this));
  },
  
  // initialize a single label.
  // - only applicable to textarea and input[text] and input[password]
  // - arrange for label_focused and label_blurred to be called for focus and blur
  // - show the initial label
  // - for other element types, show the default label
  initLabel: function(label) {
  	try {
  		var input     = $(label.htmlFor);
  		var inputTag  = input.tagName.toLowerCase();
  		var inputType = input.type;
  		if (inputTag == "textarea" || (inputType == "text" || inputType == "password")) {
  		  Element.setStyle(label, { position: 'absolute', visibility: 'hidden'});
  			Object.extend(input, {
  		    _labeltext: label.childNodes[0].nodeValue,
  		    _type: inputType
  		  });
  			Event.observe(input, 'focus', this.focused.bind(this));
  			Event.observe(input, 'blur', this.blurred.bind(this));
  			this.blurred({target:input});
  		} else {
  		  Element.setStyle(label, { position: 'static', visibility: 'visible' });
  		}
  	}
  	catch (e) { 
  	  Element.setStyle(label, { position: 'static', visibility: 'visible' });
  	}
  },
  
  focused: function(e) {
  	var el = Event.element(e);
  	if (el.value == el._labeltext) el = this.hide(el)
  	el.select();
  },

  blurred: function(e) {
    var el = Event.element(e);
  	if (el.value == "") el = this.show(el);
  },
  
  hide: function(el) {
  	if (el._type == "password") el = this.setInputType(el, "password");
  	el.value = "";
	  Element.removeClassName(el, this.options.className);
  	return el;
  },

  show: function(el) {
  	if (el._type == "password") el = this.setInputType(el, "text");
  	Element.addClassName(el, this.options.className);
  	el.value = el._labeltext;
  	return el;
  },
  
  setInputType: function (el, type) {
    try {
      el.type = type;
      return el;
    }
    catch (e) { //IE can't set the type parameter
      var newEl = document.createElement("input");
      newEl.type = type;
  		for (prop in el) {
  			try {
  			  // crazy bug that still exists in ie 7 with width and heights, use class name if necessary instead!
   				if (prop != "type" && prop != "height" && prop != "width") { 
  				  newEl[prop] = el[prop];
  				}
  			} 
  			catch(e) { }
  		}
  		Event.observe(newEl, 'focus', this.focused.bind(this));
			Event.observe(newEl, 'blur', this.blurred.bind(this));
  		el.parentNode.replaceChild(newEl, el);
  		return newEl;
    }
  }
}

Event.observe(window, 'load', stereolabelsInit, false);

var myLabels = null;
function stereolabelsInit() {
	myLabels = new stereolabels();
}