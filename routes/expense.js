var express = require('express');
var router = express.Router();

//import database
var connection = require('../library/database');

/**
 * INDEX expense
 */
router.get('/', function (req, res, next) {
    //query
    connection.query('SELECT * FROM expense ORDER BY id desc', function (err, rows) {
        if (err) {
            req.flash('error', err);
            res.render('expense', {
                data: ''
            });
        } else {
            //render ke view expense index
            res.render('expense/index', {
                data: rows // <-- data expense
            });
        }
    });
});

/**
 * CREATE POST
 */
router.get('/create', function (req, res, next) {
    res.render('expense/create', {
        title: '',
        content: ''
    })
})

/**
 * STORE POST
 */
router.post('/store', function (req, res, next) {
    

    let title   = req.body.title;
    let content = req.body.content;
    let errors  = false;

    if(title.length === 0) {
        errors = true;

        // set flash message
        req.flash('error', "Silahkan Masukkan Title");
        // render to add.ejs with flash message
        res.render('expense/create', {
            title: title,
            content: content
        })
    }

    if(content.length === 0) {
        errors = true;

        // set flash message
        req.flash('error', "Silahkan Masukkan Konten");
        // render to add.ejs with flash message
        res.render('expense/create', {
            title: title,
            content: content
        })
    }

    // if no error
    if(!errors) {

        let formData = {
            title: title,
            content: content
        }
        
        // insert query
        connection.query('INSERT INTO expense SET ?', formData, function(err, result) {
            //if(err) throw err
            if (err) {
                req.flash('error', err)
                 
                // render to add.ejs
                res.render('expense/create', {
                    title: formData.title,
                    content: formData.content                    
                })
            } else {                
                req.flash('success', 'Data Berhasil Disimpan!');
                res.redirect('/expense');
            }
        })
    }

})

/**
 * EDIT POST
 */
router.get('/edit/(:id)', function(req, res, next) {

    let id = req.params.id;
   
    connection.query('SELECT * FROM expense WHERE id = ' + id, function(err, rows, fields) {
        if(err) throw err
         
        // if user not found
        if (rows.length <= 0) {
            req.flash('error', 'Data Post Dengan ID ' + id + " Tidak Ditemukan")
            res.redirect('/expense')
        }
        // if book found
        else {
            // render to edit.ejs
            res.render('expense/edit', {
                id:      rows[0].id,
                title:   rows[0].title,
                content: rows[0].content
            })
        }
    })
})

/**
 * UPDATE POST
 */
router.post('/update/:id', function(req, res, next) {

    let id      = req.params.id;
    let title   = req.body.title;
    let content = req.body.content;
    let errors  = false;

    if(title.length === 0) {
        errors = true;

        // set flash message
        req.flash('error', "Silahkan Masukkan Title");
        // render to edit.ejs with flash message
        res.render('expense/edit', {
            id:         req.params.id,
            title:      title,
            content:    content
        })
    }

    if(content.length === 0) {
        errors = true;

        // set flash message
        req.flash('error', "Silahkan Masukkan Konten");
        // render to edit.ejs with flash message
        res.render('expense/edit', {
            id:         req.params.id,
            title:      title,
            content:    content
        })
    }

    // if no error
    if( !errors ) {   
 
        let formData = {
            title: title,
            content: content
        }

        // update query
        connection.query('UPDATE expense SET ? WHERE id = ' + id, formData, function(err, result) {
            //if(err) throw err
            if (err) {
                // set flash message
                req.flash('error', err)
                // render to edit.ejs
                res.render('expense/edit', {
                    id:     req.params.id,
                    name:   formData.name,
                    author: formData.author
                })
            } else {
                req.flash('success', 'Data Berhasil Diupdate!');
                res.redirect('/expense');
            }
        })
    }
})

/**
 * DELETE POST
 */
router.get('/delete/(:id)', function(req, res, next) {

    let id = req.params.id;
     
    connection.query('DELETE FROM expense WHERE id = ' + id, function(err, result) {
        //if(err) throw err
        if (err) {
            // set flash message
            req.flash('error', err)
            // redirect to expense page
            res.redirect('/expense')
        } else {
            // set flash message
            req.flash('success', 'Data Berhasil Dihapus!')
            // redirect to expense page
            res.redirect('/expense')
        }
    })
})

module.exports = router;