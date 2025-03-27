var express = require('express');
var router = express.Router();
var connection = require('../library/database');

// INDEX
router.get('/', function (req, res, next) {
    connection.query('SELECT * FROM expense ORDER BY purchase_id DESC', function (err, rows) {
        if (err) {
            req.flash('error', err);
            res.render('expense', { data: '' });
        } else {
            res.render('expense/index', { data: rows });
        }
    });
});

// CREATE
router.get('/create', function (req, res, next) {
    res.render('expense/create', {
        purchase_date: '',
        purchase_amount: '',
        purchase_item: '',
        reimburse: ''
    });
});

// STORE
router.post('/store', function (req, res, next) {
    let purchase_date = req.body.purchase_date;
    let purchase_amount = req.body.purchase_amount;
    let purchase_item = req.body.purchase_item;
    let reimburse = req.body.reimburse;
    let errors = false;

    if (!purchase_date || !purchase_amount || !purchase_item || !reimburse) {
        errors = true;
        req.flash('error', "Please fill in all fields");
        res.render('expense/create', {
            purchase_date,
            purchase_amount,
            purchase_item,
            reimburse
        });
    }

    if (!errors) {
        let formData = { purchase_date, purchase_amount, purchase_item, reimburse };
        connection.query('INSERT INTO expense SET ?', formData, function (err) {
            if (err) {
                req.flash('error', err);
                res.render('expense/create', formData);
            } else {
                req.flash('success', 'Data successfully saved!');
                res.redirect('/expense');
            }
        });
    }
});

// EDIT
router.get('/edit/:purchase_id', function (req, res, next) {
    let purchase_id = req.params.purchase_id;
    connection.query('SELECT * FROM expense WHERE purchase_id = ?', [purchase_id], function (err, rows) {
        if (err || rows.length === 0) {
            req.flash('error', 'Data not found');
            res.redirect('/expense');
        } else {
            res.render('expense/edit', rows[0]);
        }
    });
});

// UPDATE
router.post('/update/:purchase_id', function (req, res, next) {
    console.log("Received Data:", req.body);

    let purchase_id = req.params.purchase_id;
    let purchase_date = req.body.purchase_date;
    let purchase_amount = req.body.purchase_amount;
    let purchase_item = req.body.purchase_item;
    let reimburse = req.body.reimburse;

    if (!purchase_date || !purchase_amount || !purchase_item || !reimburse) {
        req.flash('error', "Please fill in all fields");
        res.render('expense/edit', { purchase_id, purchase_date, purchase_amount, purchase_item, reimburse });
    } else {
        let formData = { purchase_date, purchase_amount, purchase_item, reimburse };
        connection.query('UPDATE expense SET ? WHERE purchase_id = ?', [formData, purchase_id], function (err) {
            if (err) {
                req.flash('error', err);
                res.render('expense/edit', { purchase_id, ...formData });
            } else {
                req.flash('success', 'Data successfully updated!');
                res.redirect('/expense');
            }
        });
    }
});

// DELETE
router.get('/delete/:purchase_id', function (req, res, next) {
    let purchase_id = req.params.purchase_id;
    connection.query('DELETE FROM expense WHERE purchase_id = ?', [purchase_id], function (err) {
        if (err) {
            req.flash('error', err);
        } else {
            req.flash('success', 'Data successfully deleted!');
        }
        res.redirect('/expense');
    });
});

module.exports = router;