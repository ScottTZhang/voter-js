$(function() {
  $(document).on("click", ".add_item_class", function(e) {
    console.log(e.target);
    $(e.target).parent().parent().before(
        '<div class="form-group item">\
          <label for="forItem1" class = "col-sm-2 control-label">Item</label>\
          <div class="col-sm-10">\
            <input name="item" class="form-control" type="text" placeholder="item"/>\
          </div>\
        </div>');
  });

  $("#add_question_btn").click(function() {
    $(".add_question").before(
      '<div class="question">\
        <div class="form-group">\
          </br>\
          <label for="forQuestion1" class = "col-sm-2 control-label">Question</label>\
          <div class="col-sm-10">\
            <input name="question" class="form-control" type="text" placeholder="Describe your question"/>\
          </div>\
        </div>\
        <div class="form-group item">\
          <label for="forItem1" class = "col-sm-2 control-label">ItemA</label>\
          <div class="col-sm-10">\
            <input name="item" class="form-control" type="text" placeholder="item"/>\
          </div>\
        </div>\
        <div class="form-group add_item">\
          <div class="col-sm-offset-2 col-sm-10">\
            <button type="button" class="btn btn-default add_item_class">Add Item</button>\
          </div>\
        </div>\
      </div>');

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
