var nunjucks = require('nunjucks'); //package
var express = require('express');
var path = require('path');
//var request = require('request');
var mysql = require('mysql');
var async = require('async');
var bodyparser = require('body-parser'); // request body to hash;detect name attribute in html file
var app = express();

//configuration values
var MIN_ITEM_AMOUNT = 2;
var MAX_ITEM_AMOUNT = 10;
var MIN_QUESTION_AMOUNT = 1;
var MAX_QUESTION_AMOUNT = 10;

app.use(bodyparser.urlencoded({
  extended:true
}));

nunjucks.configure('views', {
  autoescape: true,
  express: app
});

app.use('/public', express.static(path.join(__dirname, 'public'))); //can use files in /public directory

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '1112',
  database : 'voter'
});

connection.connect();

app.get('/', function(req, res) {
  if (req.query.q) { // get string from query string in url ?q=...
    var query = req.query.q;
    res.render('index.html', {
      source: query //give a name for body called source, source will be used in html file
    });
  } else {
    res.render('index.html');
  }
});

app.get('/sections', function(req, res) {// /sections is website page, and has nothing to do with file path

  var msg = req.query.msge; //get msge from quesry string in url, ?msge=...
  connection.query('SELECT * FROM Section WHERE status <> 0', function(err, rows, fields){

    if (!err) {
      res.render('sections.html', {
        data : rows,
        message : msg
      });
    } else {
      res.send(err);
    }
  });

});

/*  test: When select a section, show all surveys
*/
app.get('/section/:id', function(req, res) {
  var id = req.params.id;
  var query = connection.query('SELECT * from Survey WHERE status=1 AND sectionId='+id, function(err, rows, fields) {
    if (!err) {
      res.render('section.html', {
        surveys : rows
      });
    } else {
      res.render(err);
    }
  });
});

/*  test: When select a survey, show all questions and items from the survey
*/
app.all('/survey/:id', function(req, res) {
  var id = req.params.id;
  var sql ='SELECT Question.id AS qid, Item.id AS iid,title,question,item from Survey,Question,Item where Survey.id=' + id +' AND Survey.status=1 AND Question.surveyId=Survey.id AND Item.questionId=Question.id ORDER BY qid,iid;';

  if (req.method == 'GET') {
    var query = connection.query(sql, function(err, rows, fields) {
      if (!err) {
        if(rows.length == 0) {
          res.status(404).send('Survey ' + id + ' is not found');
        } else {
          res.render('survey.html',{
            questions: rows,
            surveyId: id,
          });
        }
      } else {
        res.send(err);
      }
    });
  }
  else if (req.method == 'POST') {
    var body = req.body;
    var itemIdtoUpdate =[];
    for (var key in body) {
      itemIdtoUpdate.push(body[key]);
    }

    var cnt = 0;
    async.series({
      countQuestion: function(callback) {
        connection.query('SELECT COUNT(*) as cntQuestion from Question WHERE surveyId='+id, function(err, rows, field) {
          if (!err) {
            if (rows.length == 0) {
              res.status(404).send('Survey not found');
            } else {
              cnt = rows[0].cntQuestion;
            }
          } else {
            res.render(err);
          }
          callback(null);
        });
      },
      post: function(callback) {
        if (Object.keys(body).length < cnt) {
          var query = connection.query(sql, function(err, rows, fields) {
            if (!err) {
              res.render('survey.html', {
                msg: 'you have questions unfilled',
                cache: body,
                questions: rows
              });
            } else {
              res.render(err);
            }
            callback(null);
          });
        }
        else {
          var updateSql = 'UPDATE Item SET count=count+1 WHERE id IN ('+itemIdtoUpdate.join(',') + ')';
          var query = connection.query(updateSql, function(err, rows, field) {
            if(!err) {
              res.redirect('/display/survey/'+id);
            } else {
              res.render(err);
            }
            callback(null);
          });
        }
      }
    });
  }
});

app.get('/display/survey/:id', function(req, res) {
  var id = req.params.id;
  var successSubmit = 'submit successfully';
  res.render('display.html', {
    msg: successSubmit,
    id: id
  });
});

app.get('/result/:id', function(req, res) {
  var id = req.params.id;
  res.render('result.html', {
    id: id
  });
});

app.all('/surveys/add', function(req, res) {
  if (req.method == 'GET') {
    var body = req.body;
    res.render('add-survey-form.html');
  }
  else if (req.method == 'POST') {
    var body = req.body;
    var survey = JSON.parse(body.surveyJSON);
    var surveyId = null;
    var questionId = null;

    //validation part
    var hasErr = false;
    if (survey.stitle == '' || survey.stitle == null) {
      survey.titleExcept = 'Please fill in title.';
      hasErr = true;
    }
    else{
      var cntQuestion = survey.questions.length;
      if (cntQuestion < MIN_QUESTION_AMOUNT || cntQuestion > MAX_QUESTION_AMOUNT) {
        survey.cntQuestionExcept = 'Question amount between 1 and 10.';
        hasErr = true;
      }
      for (var i = 0; i < survey.questions.length; i++) {
        var q = survey.questions[i];
        if ((q.question == '' || q.question == null)) {
          survey.questions[i].questionExcept = 'Please fill in question.';
          hasErr = true;
        }

        var cntItem = q.items.length;
        if (cntItem < MIN_ITEM_AMOUNT || cntItem > MAX_ITEM_AMOUNT) {
          survey.questions[i].cntItemExcept = 'Item amount between 2 and 10.';
          hasErr = true;
        }
        for (var j = 0; j < q.items.length; j++) {
          var it = q.items[j];
          if ((it.item == '' || it.item == null)) {
            survey.questions[i].items[j].itemExcept = 'Please fill in item.';
            hasErr = true;
          }
        }
      }
    }

    if(hasErr) {
      return res.render('add-survey-form.html', {
        data: survey,
        msg: "Some input errors"
      });
    }
    async.series({
      createSurvey: function(callback) {
        var sql = 'INSERT INTO Survey(title, description, holder, sectionId) VALUES(\''
        + survey.stitle + '\',\''
        + survey.sdesc + '\',\''
        + survey.holder + '\','
        + survey.sectionId
        + ');';
        var query = connection.query(sql, function(err, rows, fields) {
          if (!err) {
            surveyId = rows.insertId;
          }
          callback(err);
        });
      },

      createQuestion: function(callback) {
        async.eachSeries(survey.questions, function(questionHash, questionArrCallback){
          var questionSql = 'INSERT INTO Question(question, surveyId) VALUES(\''
          + questionHash.question + '\','
          + surveyId
          + ');';
          async.series({
            createQuestion: function(questionCallback) {
              var addQuestionQuery = connection.query(questionSql, function(questionErr, questionRows, questionFields) {
                if (!questionErr) {
                  questionId = questionRows.insertId;
                }
                questionCallback(questionErr);
              });
            },

            createItem: function(itemArrCallback) {
              async.eachSeries(questionHash.items, function(item, itemCallback){
                var itemSql = 'INSERT INTO Item(item, questionId) VALUES(\''
                + item.item +'\','
                + questionId
                + ');';
                var addItemQuery = connection.query(itemSql, function(itemErr, itemRows, itemFields) {
                  if (!itemErr) {
                  }
                  itemCallback(itemErr);
                });
              },
              function(itemEachSeriesErr){
                if (!itemEachSeriesErr) {
                }
                itemArrCallback(itemEachSeriesErr);
              });
            }
          }, questionArrCallback); //end async series in createQuestion
        }, function(questionEachSeriesErr){
          if (!questionEachSeriesErr) {
          }
          callback(questionEachSeriesErr);
        }); //end async eachSeries in createQuestion
      } // end createQuestion task
    },

    function(err) {
      if (err) {
        res.render(err);
      } else {
        res.send('success page');
      }
    }); //end async series in POST
  } //end POST
});

/* test: When edit a item from a question in a suvey, get the item id from:
 *  SELECT Item.id,title,question,item from Survey,Question,Item where Survey.id=4 And Survey.status=1 AND Question.surveyId=Survey.id AND Item.questionId=Question.id;
 *  get the question id from :SELECT Question.id,title,question from Survey,Question where Survey.id=4 And Survey.status=1 AND Question.surveyId=Survey.id;
 *  get the item id from: Select Item.id from Question,Item where Question.status=1 AND Question.id=Item.questionId;
 *  count the question in the survey: SELECT COUNT(*) from Survey, Question where Survey.status=1 AND Survey.id=4 AND Question.surveyId=Survey.id AND Question.Status=1;
 */

app.get('/section/delete/:id', function(req, res) {
  var id = req.params.id;
  var msg = 'delete suceessfully.';
  var query = connection.query('UPDATE Section SET status=0 WHERE id=' + id, function(err, rows, fields) {
    if (!err) {
      res.redirect('/sections?msge='+msg);
    } else {
      res.render(err);
    }
  });
});

function hashfyQuery(rows) {
  var res = {};
  res.sid = rows[0].sid;//surveyId
  res.stitle = rows[0].stitle;
  res.sdesc = rows[0].sdesc;
  res.holder = 'admin'; //to be changed
  res.sectionId = 2;//to be changed
  res.titleExcept = null;
  res.cntQuestionExcept = null;

  var questions = [];
  for (var i = 0; i < rows.length; i++) {
    if (i == 0 || rows[i].qid != rows[i - 1].qid) {
      var q = {};
      q.qid = rows[i].qid;
      q.question = rows[i].question;
      q.items = [];
      q.questionExcept = null;
      q.cntItemExcept = null;

      var it = {};
      it.iid = rows[i].iid;
      it.item = rows[i].item;
      q.items.push(it);

      questions.push(q);
    } else {
      var q = questions[questions.length - 1];
      var it = {};
      it.iid = rows[i].iid;
      it.item = rows[i].item;
      it.itemExcept = null;
      q.items.push(it);
    }
  }
  res.questions = questions;
  return res;
}

//edit a survey based on id
app.all('/surveys/edit/:id', function(req, res) {
  var id = req.params.id;

  if ( req.method == 'GET') {
    var sql ='SELECT Survey.id AS sid, Survey.title AS stitle, Survey.description as sdesc, Question.id AS qid, question, Item.id AS iid, item from Survey,Question,Item where Survey.id=' + id +' AND Survey.status=1 AND Question.status=1 And Item.status=1 AND Question.surveyId=Survey.id AND Item.questionId=Question.id ORDER BY qid,iid;';
    var query = connection.query(sql, function(err, rows, fields) {
      if (!err) {
        if(rows.length == 0) {
          res.status(404).send('Survey ' + id + ' is not found');
        } else {
          res.render('edit-survey-form.html',{
            data: hashfyQuery(rows)
          });
        }
      } else {
        res.send(err);
      }
    });
  }
  else if (req.method == 'POST') {
    var body = req.body;
    var survey = JSON.parse(body.surveyJSON);
    survey.sid = id;
    var surveyId;

    //validation part
    var hasErr = false;
    if (survey.stitle == '' || survey.stitle == null) {
      survey.titleExcept = 'Please fill in title.';
      hasErr = true;
    }
    else{
      var cntQuestion = survey.questions.length;
      for (var index = 0; index < survey.questions.length; index++) {
        if (survey.questions[index].qDelete == '1')
          cntQuestion--;
      }
      if (cntQuestion < MIN_QUESTION_AMOUNT || cntQuestion > MAX_QUESTION_AMOUNT) {
        survey.cntQuestionExcept = 'Question amount between 1 and 10.';
        hasErr = true;
      }
      for (var i = 0; i < survey.questions.length; i++) {
        var q = survey.questions[i];
        if ((q.question == '' || q.question == null) && q.qDelete != '1') {
          survey.questions[i].questionExcept = 'Please fill in question.';
          hasErr = true;
        }

        var cntItem = q.items.length;
        for (var index = 0; index < q.items.length; index++) {
          if (q.items[index].itemDelete == '1')
            cntItem--;
        }
        if (cntItem < MIN_ITEM_AMOUNT || cntItem > MAX_ITEM_AMOUNT) {
          survey.questions[i].cntItemExcept = 'Item amount between 2 and 10.';
          hasErr = true;
        }
        for (var j = 0; j < q.items.length; j++) {
          var it = q.items[j];
          if ((it.item == '' || it.item == null) && it.itemDelete != '1') {
            survey.questions[i].items[j].itemExcept = 'Please fill in item.';
            hasErr = true;
          }
        }
      }
    }
    if(hasErr) {
      return res.render('edit-survey-form.html', {
        data: survey,
        msg: "Some input errors"
      });
    }
    async.series({
      createSurvey: function(callback) {
        var sql;
        if (survey.sid) {
          sql = 'UPDATE Survey SET title=\''+survey.stitle+'\', description=\''+survey.sdesc+'\' WHERE id='+id+';';
          surveyId = id;
        } else {
          surveyId = null;
          sql = 'INSERT INTO Survey(title, description, holder, sectionId) VALUES(\''
          + survey.stitle + '\',\''
          + survey.sdesc + '\',\''
          + survey.holder + '\','
          + survey.sectionId
          + ');';
        }
        var query = connection.query(sql, function(err, rows, fields) {
          if (!err) {
            if(surveyId == null)
              surveyId = rows.insertId;
          }
          callback(err);
        });
      },

      createQuestion: function(callback) {
        async.eachSeries(survey.questions, function(questionHash, questionArrCallback){
          var questionSql;
          var questionId;
          if (questionHash.qid == null || questionHash.qid == undefined) {
            questionId = null;
            questionSql = 'INSERT INTO Question(question, surveyId) VALUES(\''
            + questionHash.question + '\','
            + surveyId
            + ');';
          } else {
            if (questionHash.qDelete == '1') {
              questionSql = 'UPDATE Question SET status=0 WHERE id='+questionHash.qid+';';
            } else {
              questionSql = 'UPDATE Question SET question=\''+questionHash.question+'\' WHERE id='+questionHash.qid+';';
            }
            questionId = questionHash.qid;
          }
          async.series({
            createQuestion: function(questionCallback) {
              var addQuestionQuery = connection.query(questionSql, function(questionErr, questionRows, questionFields) {
                if (!questionErr) {
                  if (questionId == null)
                    questionId = questionRows.insertId;
                }
                questionCallback(questionErr);
              });
            },

            createItem: function(itemArrCallback) {
              async.eachSeries(questionHash.items, function(item, itemCallback){
                var itemSql;

                if(item.iid == undefined || item.iid == null) {
                  itemSql = 'INSERT INTO Item(item, questionId) VALUES(\''
                  + item.item +'\','
                  + questionId
                  + ');';
                } else {
                  if (item.itemDelete == '1') {
                    itemSql = 'UPDATE Item SET status=0 WHERE id='+item.iid+';';
                  } else {
                    itemSql = 'UPDATE Item SET item=\''+item.item+'\' WHERE id='+item.iid+';';
                  }
                }
                var addItemQuery = connection.query(itemSql, function(itemErr, itemRows, itemFields) {
                  if (!itemErr) {
                  }
                  itemCallback(itemErr);
                });
              }, function(itemEachSeriesErr){
                if (!itemEachSeriesErr) {
                }
                itemArrCallback(itemEachSeriesErr);
              });
            }
          }, questionArrCallback); //end async series in createQuestion
        },
        function(questionEachSeriesErr){
          if (!questionEachSeriesErr) {
          }
          callback(questionEachSeriesErr);
        }); //end async eachSeries in createQuestion
      } // end createQuestion task
    },

    function(err) {
      if (err) {
        res.send(err);
      } else {
        res.send('success page');
      }
    }); //end async series in POST
  }
});

app.all('/sections/edit/:id', function(req, res) { //:id means the parameter in this part of url is called 'id'
  var id = req.params.id; //get the 'id' part from the url, not from qurey string; from query string use req.query.'...'
  if (req.method == 'GET') {//req default method is GET
    connection.query('SELECT * FROM Section WHERE id='+id, function(err, rows, fields){
      if (!err) {
        if (rows.length > 0) {
          res.render('edit-section-form.html', {
            data : rows[0]
          });
        } else {
          res.status(404).send('not found'); //if query result is empty, return 404 page
        }
      } else {
        res.send(err);
      }
    });
  }
  else if (req.method == 'POST') {//can be set method to POST in html file form tag
    var body = req.body;//a hashtable with names and values got from html tag with 'name' attribute
    body.id = id;
    if (body.name == '' || body.name == undefined) {
      res.render('edit-section-form.html', {
        data : body,
        except : 'no name input'
      });
    }
    else {
      var msg = 'edit successfully';
      var query = connection.query('UPDATE Section SET ? where id='+id, body, function(err, rows, fields){ // this will automatic match table column names with names in body, and change values
        if (!err) {
          res.redirect('/sections?msge='+msg);//make msg a part of query string so that req.query.msge will find msg
        } else {
          res.send(err);
        }
      });
    }
  }
});

/* problem: when input name is '', it should not post
*/
app.all('/sections/add', function(req, res){
  if (req.method == 'GET') {
    res.render('add-section-form.html');
  }
  else if (req.method == 'POST') {

    var body = req.body;

    if (body.name == '' || body.name === undefined) {
      res.render('add-section-form.html', {
        except : 'no name',
        cache : body
      });
    }
    else {
      var msg = 'add successfully';
      var values = '\'' + body.name + '\',\'' + body.description + '\','+ 1;
      var query = connection.query('INSERT INTO Section(name, description, status) VALUES('+values+')', function(err, rows, fields) {
        if (!err) {
          res.redirect('/sections?msge='+msg);
        } else {
          res.render(err);
        }
      });
    }
  }
});

var server = app.listen(3000, function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Now listening at: ' + host + ':' + port);
});
