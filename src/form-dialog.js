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
  var dialogTemplate =
    '<div id=<%= id%> class="modal fade">' +
      '<div class="modal-dialog">' +
        '<div class="modal-content">' +
          '<div class="modal-header" style="background: #c9c9c9;"><h4><%= title%></h4></div>' +
          '<div class="modal-body"></div>' +
          '<div class="modal-footer" style="text-align: center">' +
            '<button type="submit" form="<%=formId%>" class="btn btn-primary">保存</button>' +
            '<button class="btn btn-default" data-dismiss="modal">取消</button>' +
          '</div>'
        '</div>' +
      '</div>' +
    '</div>'

  function getFormData(form) {
    var array = form.serializeArray();
    var data = {};

    $.map(array, function(item){
      data[item['name']] = item['value'];
    });

    return data;
  }
  $.formDialog = function (options, formSchema, data, onSubmit, onLoad) {
    var modal = $('#' + options.id), formElem = null;
    if(modal.length === 0) {
      options.formId = formSchema.id;
      modal = $(_.template(dialogTemplate)(options)).appendTo(document.body);
    } else {
      modal.find('h4').text(options.title);
    }
    $.jsonform(formSchema, modal.find('.modal-body').html(''));

    formElem = $('#'+formSchema.id);
    if (data) {
      formElem.deserialize(data);
    }
    formElem.validate({
      submitHandler: function () {
        onSubmit(getFormData(formElem));
        modal.modal('hide');
      }
    });

    onLoad && onLoad();
    modal.modal('show');
  }
}));
