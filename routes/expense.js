var express = require('express');
var router = express.Router();
var multer = require('multer');
var path = require('path');

var connection = require('../library/database');

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

var upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, 
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
}).single('purchase_receipt');

function checkFileType(file, cb) {
    var filetypes = /jpeg|jpg|png|pdf/;
    var extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    var mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('File Type Error!');
    }
}

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
        purchase_receipt: '',
        reimburse: '',
        reimburse_status: ''
    });
});

// STORE
router.post('/store', function (req, res, next) {
    let purchase_date = req.body.purchase_date;
    let purchase_amount = req.body.purchase_amount;
    let purchase_item = req.body.purchase_item;
    let purchase_receipt = req.file ? req.file.filename : null;
    let reimburse = req.body.reimburse;
    let reimburse_status = req.body.reimburse_status;
    let errors = false;

    if (!purchase_date || !purchase_amount || !purchase_item || !reimburse) {
        errors = true;
        req.flash('error', "Please Fill In All Fields");
        res.render('expense/create', {
            purchase_date,
            purchase_amount,
            purchase_item,
            purchase_receipt,
            reimburse,
            reimburse_status
        });
    }

    if (!errors) {
        let formData = { purchase_date, purchase_amount, purchase_item, purchase_receipt, reimburse, reimburse_status };
        connection.query('INSERT INTO expense SET ?', formData, function (err) {
            if (err) {
                req.flash('error', err);
                res.render('expense/create', formData);
            } else {
                req.flash('success', 'Data Successfully Saved!');
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
            req.flash('error', 'Data Not Found');
            res.redirect('/expense');
        } else {
            res.render('expense/edit', rows[0]);
        }
    });
});

// UPDATE
router.post('/update/:purchase_id', function (req, res, next) {

    let purchase_id = req.params.purchase_id;
    let purchase_date = req.body.purchase_date;
    let purchase_amount = req.body.purchase_amount;
    let purchase_item = req.body.purchase_item;
    let purchase_receipt = req.file ? req.file.filename : old_purchase_receipt;
    let reimburse = req.body.reimburse;
    let reimburse_status = req.body.reimburse_status;

    if (!purchase_date || !purchase_amount || !purchase_item || !purchase_receipt || !reimburse || !reimburse_status) {
        req.flash('error', "Please Fill In All Fields");
        res.render('expense/edit', { purchase_id, purchase_date, purchase_amount, purchase_item, purchase_receipt, reimburse, reimburse_status });
    } else {
        let formData = { purchase_date, purchase_amount, purchase_item, purchase_item, purchase_receipt, reimburse, reimburse_status };
        connection.query('UPDATE expense SET ? WHERE purchase_id = ?', [formData, purchase_id], function (err) {
            if (err) {
                req.flash('error', err);
                res.render('expense/edit', { purchase_id, ...formData });
            } else {
                req.flash('success', 'Data Successfully Updated!');
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
            req.flash('success', 'Data Successfully Deleted!');
        }
        res.redirect('/expense');
    });
});

module.exports = router;