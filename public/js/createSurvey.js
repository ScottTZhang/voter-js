$(function() {

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
