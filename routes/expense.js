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
    storage: multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, './public/uploads/');
    },
    filename: function (req, file, cb) {
        let purchase_id = req.body.purchase_id || 'unknown';
        cb(null, file.originalname);
    }
}),
    limits: { fileSize: 1000000 }, 
    fileFilter: function(req, file, cb) {
        var filetypes = /jpeg|jpg|png|pdf/;
        var extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        var mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('File Type Error!');
        }
    }
});

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
        purchase_receipt: '',
        purchase_amount: '',
        reimburse: '',
        reimburse_status: ''
    });
});

// STORE
router.post('/store', upload.single('purchase_receipt'), function (req, res, next) {
    let purchase_date = req.body.purchase_date;
    let purchase_receipt = req.file ? req.file.filename : null;
    let purchase_amount = req.body.purchase_amount;
    let reimburse = req.body.reimburse;
    let reimburse_status = Array.isArray(req.body.reimburse_status) ? req.body.reimburse_status.pop() : req.body.reimburse_status; reimburse_status = reimburse_status === '1' ? 1 : 0;
    let errors = false;

    if (!purchase_date || !purchase_amount || !reimburse || !reimburse_status === null || !reimburse_status === undefined) {
        errors = true;
        req.flash('error', "Please Fill In All Fields");
        res.render('expense/create', {
            purchase_date,
            purchase_receipt,
            purchase_amount,
            reimburse,
            reimburse_status
        });
    }

    if (!errors) {
        let formData = { purchase_date, purchase_receipt, purchase_amount, reimburse, reimburse_status };
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
router.post('/update/:purchase_id', upload.single('purchase_receipt'), function (req, res, next) {

    let purchase_id = req.params.purchase_id;
    let purchase_date = req.body.purchase_date;
    let old_purchase_receipt = req.body.old_purchase_receipt;
    let purchase_receipt = req.file ? req.file.originalname : old_purchase_receipt;
    let purchase_amount = req.body.purchase_amount;
    let reimburse = req.body.reimburse;
    let reimburse_status = Array.isArray(req.body.reimburse_status) ? req.body.reimburse_status.pop() : req.body.reimburse_status; reimburse_status = reimburse_status === '1' ? 1 : 0;

    if (!purchase_date || !purchase_amount || !reimburse || !reimburse_status === null || !reimburse_status === undefined) {
        req.flash('error', "Please Fill In All Fields");
        res.render('expense/edit', { purchase_id, purchase_date, purchase_receipt, purchase_amount, reimburse, reimburse_status });
    } else {
        let formData = { purchase_date, purchase_receipt, purchase_amount, reimburse, reimburse_status };
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