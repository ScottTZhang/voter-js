$(function() {

  $(document).ready(function(){
        $(this).scrollTop(0);
  });

  $(document).on("click", ".add_item_class", function(e) {
    $(e.target).parent().parent().before(
        '<div class="form-group item">\
          <label for="forItem1" class = "col-sm-2 control-label">Item</label>\
          <div class="col-sm-8">\
            <input name="item" class="form-control" type="text" placeholder="item" data-delete/>\
          </div>\
          <div class="col-sm-2">\
            <button type="button" class="btn btn-warning btn-sm delete_item_class">Delete</button>\
          </div>\
        </div>');
  });

  $(document).on("click", ".delete_question_class", function(e) {
    var questionInputArr = $(this).closest('.question').find('input');
    questionInputArr[0].dataset.delete = '1';
    console.log(questionInputArr[0].dataset);
    if (questionInputArr[0].dataset.id==null || questionInputArr[0].dataset.id=='') {
      $(this).closest('.question').remove();
      console.log('question removed');
    } else {
      $(this).closest('.question').hide();
      console.log('question hidden');
    }
  });

  $(document).on("click", ".delete_item_class",function(e) {
    var itemInput = $(this).parent().prev().find('input')[0];
    itemInput.dataset.delete = '1';
    if (itemInput.dataset.id) {
      $(this).closest('.item').hide();
      console.log('item hidden');
    } else {
      $(this).closest('.item').remove();
      console.log('item removed');
    }
  });

  $("#add_question_btn").click(function() {
    $(".add_question").before(
      '<div class="question">\
        <div class="form-group">\
          </br>\
          <label for="forQuestion1" class = "col-sm-2 control-label">Question</label>\
          <div class="col-sm-8">\
            <input name="question" class="form-control" type="text" placeholder="Describe your question" data-delete/>\
          </div>\
          <div class="col-sm-2">\
            <button type="button" class="btn btn-warning btn-sm delete_question_class">Delete</button>\
          </div>\
        </div>\
        <div class="form-group item">\
          <label for="forItem1" class = "col-sm-2 control-label">Item</label>\
          <div class="col-sm-8">\
            <input name="item" class="form-control" type="text" placeholder="item" data-delete/>\
          </div>\
          <div class="col-sm-2">\
            <button type="button" class="btn btn-warning btn-sm delete_item_class">Delete</button>\
          </div>\
        </div>\
        <div class="form-group add_item">\
          <div class="col-sm-offset-2 col-sm-10">\
            <button type="button" class="btn btn-default add_item_class">Add Item</button>\
          </div>\
        </div>\
      </div>');

  });

  $("#edit_survey_btn").click(function() {
    var survey = {};
    survey.holder = "admin";
    survey.sectionId = 2;

    survey.stitle = $("#forName").val().trim();
    survey.sdesc = $("#forDescription").val().trim();

    var qs = [];
    var questions = $(".question");
    for (var i = 0; i < questions.length; i++) {
      var arr = $(questions[i]).find("input");

      var q = {};
      q.question = arr[0].value.trim();;
      var qId = arr[0].dataset.id;
      if (qId == undefined) {
        q.qid = null;
      } else {
        q.qid = parseInt(qId);
      }
      q.qDelete = arr[0].dataset.delete;

      var is = [];
      for (var j = 1; j < arr.length; j++) {
        var it = {};
        var iId = arr[j].dataset.id;
        if (iId == undefined) {
          it.iid = null;
        } else {
          it.iid = parseInt(iId);
        }
        it.itemDelete = arr[j].dataset.delete;
        it.item = arr[j].value.trim();
        is.push(it);
      }
      q.items = is;
      qs.push(q);
    }

    survey.questions = qs;

    surveyJson = JSON.stringify(survey);

    $.post(document.URL, {surveyJSON: surveyJson}, function(data) {
      if (data == 'success page') {
        window.location.href = "/sections";
      } else {
        document.open();
        document.write(data);
        document.close();
      }
    });
  });

  $("#create_survey_btn").click(function() {
    var survey = {};
    survey.holder = "admin";
    survey.sectionId = 2;

    survey.stitle = $("#forName").val().trim();

    survey.sdesc = $("#forDescription").val().trim();

    var qs = [];
    var record = []; //record the item num attached to the question
    var questions = $(".question");
    for (var i = 0; i < questions.length; i++) {
      var arr = $(questions[i]).find("input");
      var q = {};
      q.question = arr[0].value.trim();
      var is = [];
      for (var j = 1; j < arr.length; j++) {
        var it = {};
        it.item = arr[j].value.trim();
        is.push(it);
      }
      q.items = is;
      qs.push(q);
    }

    survey.questions = qs;
    console.log(survey);
    surveyJson = JSON.stringify(survey);

    $.post('/surveys/add', {surveyJSON: surveyJson}, function(data) {
      if (data == 'success page') {
        window.location.href = "/sections";
      } else {
        document.open();
        document.write(data);
        document.close();
      }
    });
  });
});
