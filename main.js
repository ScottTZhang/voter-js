var nunjucks = require('nunjucks'); //package
var express = require('express');
var path = require('path');
//var request = require('request');
var mysql = require('mysql');
var async = require('async');
var bodyparser = require('body-parser'); // request body to hash;detect name attribute in html file
var app = express();

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
      console.log(rows);
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
      console.log(rows);
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
          console.log('survey ' + id);
          //console.log(rows);
          res.render('survey.html',{
            questions: rows,
            surveyId: id,
          });
        }
      } else {
        res.render(err);
      }
    });
  }
  else if (req.method == 'POST') {
    var body = req.body;
    console.log(body);
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
        console.log('cnt= ' + cnt);
        console.log('len= ' + Object.keys(body).length);
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
  console.log(id);
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
  var query = connection.query('UPDATE Section SET status = 0 WHERE id=' + id, function(err, rows, fields) {
    if (!err) {
      res.redirect('/sections?msge='+msg);
    } else {
      res.render(err);
    }
  });
  console.log(query.sql);
});

app.all('/sections/edit/:id', function(req, res) { //:id means the parameter in this part of url is called 'id'
  var id = req.params.id; //get the 'id' part from the url, not from qurey string; from query string use req.query.'...'
  if (req.method == 'GET') {//req default method is GET
    connection.query('SELECT * FROM Section WHERE id='+id, function(err, rows, fields){
      if (!err) {
        if (rows.length > 0) {
          res.render('edit-section-form.html', {
            data : rows[0],
            except: undefined
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
    res.render('add-section-form.html',{
      except : ''
    });
  }
  else if (req.method == 'POST') {

    var body = req.body;

    if (body.name == '' || body.name === undefined) {
      console.log("empty name");
      console.log(body);
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
      console.log(query.sql);
    }
  }
});

var server = app.listen(3000, function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});
