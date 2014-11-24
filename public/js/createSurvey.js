$(function() {

  $(document).ready(function(){
        $(this).scrollTop(0);
  });

  $(document).on("click", ".add_item_class", function(e) {
    console.log(e.target);
    $(e.target).parent().parent().before(
        '<div class="form-group item">\
        <div class="row">\
          <label for="forItem1" class = "col-sm-2 control-label">Item</label>\
          <div class="col-sm-8">\
            <input name="item" class="form-control" type="text" placeholder="item"/>\
          </div>\
          <div class="col-sm-2">\
            <button type="button" class="btn btn-warning btn-sm delete_item_class">Delete Item</button>\
          </div>\
        </div>\
        </div>');
  });

  $(document).on("click", ".delete_question_class", function(e) {
    var questionInputArr = $(this).closest('.question').find('input');
    console.log(questionInputArr[0].dataset);
    questionInputArr[0].dataset.delete = 1;
    console.log(questionInputArr[0].dataset);
    if (questionInputArr[0].dataset.id == null) {
      $(this).closest('.question').remove();
    } else {
      for (var i = 1; i < questionInputArr.length; i++) {
        questionInputArr[i].dataset.delete = 1;
      }
      $(this).closest('.question').hide();
    }
  });

  $(document).on("click", ".delete_item_class",function(e) {
    var itemInput = $(this).parent().prev().find('input')[0];
    console.log(itemInput.dataset);
    itemInput.dataset.delete = 1;
    console.log(itemInput.dataset);
    console.log($(this).closest('.item'));
    if (itemInput.dataset.id) {
      $(this).closest('.item').hide();
    } else {
      $(this).closest('.item').remove();
    }
  });

  $("#add_question_btn").click(function() {
    $(".add_question").before(
      '<div class="question">\
        <div class="form-group">\
          </br>\
          <div class="row">\
            <label for="forQuestion1" class = "col-sm-2 control-label">Question</label>\
            <div class="col-sm-8">\
              <input name="question" class="form-control" type="text" placeholder="Describe your question" data-delete/>\
            </div>\
            <div class="col-sm-2">\
              <button type="button" class="btn btn-warning btn-sm delete_question_class">Delete Question</button>\
            </div>\
          </div>\
        </div>\
        <div class="form-group item">\
          <div class="row">\
            <label for="forItem1" class = "col-sm-2 control-label">Item</label>\
            <div class="col-sm-8">\
              <input name="item" class="form-control" type="text" placeholder="item" data-delete/>\
            </div>\
            <div class="col-sm-2">\
              <button type="button" class="btn btn-warning btn-sm delete_item_class">Delete Item</button>\
            </div>\
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

    survey.title=$("#forName").val().trim();
    survey.description=$("#forDescription").val().trim();

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
          it.itemId = null;
        } else {
          it.itemId = parseInt(iId);
        }
        it.itemDelete = arr[j].dataset.delete;
        it.itemVal = arr[j].value.trim();
        is.push(it);
      }
      q.items = is;
      qs.push(q);
    }

    survey.questions = qs;

    console.log(survey);

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

    survey.title = $("#forName").val();

    survey.description = $("#forDescription").val();

    var qs = [];
    var questions = $(".question");
    for (var i = 0; i < questions.length; i++) {
      var arr = $(questions[i]).find("input");
      var q = {};
      q.question = arr[0].value;
      var is = [];
      for (var j = 1; j < arr.length; j++) {
        //console.log(arr[j].value);
        is.push(arr[j].value);
      }
      q.items = is;
      qs.push(q);
    }

    survey.questions = qs;

    console.log(survey);

    surveyJson = JSON.stringify(survey);

    $.post('/surveys/add', {surveyJSON: surveyJson}, function(data) {
      console.log("what is this? " + data);
      window.location.href = "/sections";
    });
  });
});
