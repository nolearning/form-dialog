(function (factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    // AMD is used - Register as an anonymous module.
    define(['jquery', 'underscore'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('jquery'), require('underscore'));
  } else {
    // Neither AMD nor CommonJS used. Use global variables.
    if (typeof jQuery === 'undefined') {
      throw 'bootstrap-jsonforms requires jQuery to be loaded first';
    }
    if (typeof _ === 'undefined') {
      throw 'bootstrap-jsonforms requires underscore.js to be loaded first';
    }
    factory(jQuery, _);
  }
}(function ($, _) {
  'use strict';
  var formTemplate = '<form id="<%= form.id %>" class="<% if(form.options && form.options.inline) print("form-horizontal") %>">' +
    '<%= $.jsonform.genContent(form.children)%>' +
    '</form>',
    tabsTemplate =
      '<ul class="nav nav-tabs">' +
      '<% for(var i = 0; i < tabItems.length; ++i) { %>' +
      '<li<% i === 0 && print(" class=\\"active\\"") %>>' +
      '<a data-toggle="tab" href="#<%= tabItems[i].id%>"><%= tabItems[i].label%></a>' +
      '</li>' +
      '<% } %>' +
      '</ul>' +
      '<div class="tab-content" style="border:1px solid #c9c9c9;border-top:none;padding:20px 0;">' +
      '<% for(i = 0; i < tabItems.length; ++i) { %>' +
      '<div id="<%= tabItems[i].id%>" class="tab-pane fade <% i === 0 && print("active in") %>">' +
      '<%= $.jsonform.genContent(tabItems[i].children)%>' +
      '</div>' +
      '<% } %>' +
      '</div>',
    inputTemplate = '<input class="form-control" type="<%= element.inputType ? element.inputType : element.type%>" name="<%= element.id%>"' +
      ' id="<%= element.id%>"' +
      ' <% element.readonly && print("readonly=\\"readonly\\"") %>' +
      ' <% element.placeholder && print("placeholder=\\"" + element.placeholder + "\\"") %>' +
      ' <% element.value && print("value=" + element.value)%> ' +
      ' <% element.required && print("required")%>>',
    choiceTemplate =
      '<% for(var i = 0; i < element.enums.length; ++i) {%>' +
        '<% !element.inline && print("<div class=\\"" + element.type +"\\">")%>' +
          '<label <% element.inline && print("class=\\"" +  element.type + "-inline\\"")%>>' +
            '<input type="<%= element.type%>" name="<%= element.id%>" ' +
              'value="<%= element.enums[i].value%>"> ' +
            '<%= element.enums[i].label%>' +
          '</label>' +
        '<% !element.inline && print("</div>") %>' +
      '<%}%>',
    textareaTemplate = '<textarea class="form-control" row="3" id="<%= element.id%>" name="<%= element.id%>" ' +
      '<% element.required && print("required")%>></textarea>',
    selectTemplate = '<select class="form-control" id="<%= element.id%>" name="<%= element.id%>" ' +
      '<% element.required && print("required")%>>' +
        '<% for(var i = 0; i < element.enums.length; ++i) { %>' +
          '<option value="<%= element.enums[i].value%>"><%= element.enums[i].label%></option>' +
        '<% } %>' +
      '</select>';


  var compilers = {}, options = null, hasColorPicker, hasDateTimePicker;

  function getTemplate(type, inline, hasLabel) {
    var template = '', input = '';
    if (!type) return '';
    if (type === 'tabs') return tabsTemplate;

    switch (type) {
      case 'color':
        hasColorPicker = true;
        input = inputTemplate;
        break;
      case 'datetime':
        hasDateTimePicker = true;
        input = inputTemplate;
        break;
      case 'text':
      case 'number':
      case 'email':
      case 'password':
      case 'url':
        input = inputTemplate;
        break;
      case 'radio':
      case 'checkbox':
        input = choiceTemplate;
        break;
      case 'textarea':
        input = textareaTemplate;
        break;
      case 'select':
        input = selectTemplate;
        break;
      default:
        break;
    }


    template += '<div class="form-group row">';
    if (!inline) template += '<div class="col-sm-8">';
    if (hasLabel) {
      template += '<label class="control-label' + (inline ? ' col-sm-2' : '') +
        '" for="<%= element.id%>"><%= element.label%></label>';
    }
    if (inline) template += '<div class="<% print(element.wrapClass ? element.wrapClass: "col-sm-8")%>">';
    template += input;
    template += '</div>';
    template += '</div>';
    return template;
  }

  function getCompiler(element) {
    var type = element && element.type;
    if (!type) return null;
    var inline = element.inline === undefined ? options.inline : element.inline,
      hasLabel = !!element.label, key = type + (inline ? '_inline' : '') + (hasLabel ? '_label' : '');


    if (!compilers[key]) {
      compilers[key] = _.template(getTemplate(type, inline, hasLabel));
    }
    return compilers[key];
  }

  function genContent(element) {
    var content = "", compile = getCompiler(element);

    if (Array.isArray(element)) {
      _.each(element, function (item) {
        content += genContent(item);
      })
    } else if (element.type === "tabs") {
      content = compile({tabItems: element.tabItems});
    } else {
      content = compile({element: element});
    }
    return content;
  }

  function genForm(form) {
    options = form.options ? form.options : {inline: false};
    return _.template(formTemplate)({form: form});
  }


  $.jsonform = function (data, container) {
    $(container).append(genForm(data));
    if(hasColorPicker) {
      $(container).find('input[type=color]').prop('type', 'text').colorpicker();
    }
    if(hasDateTimePicker) {
      $(container).find('input[type=datetime]').prop('type', 'text').datepicker();
    }
  }
  $.jsonform.genContent = genContent;
}));