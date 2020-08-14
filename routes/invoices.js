//import express
const express = require("express");

//import other files/functions you will uses
const db = require("../db");

//create your router
const invoicesRouter = express.Router();

const { NotFoundError, BadRequestError } = require("../expressError");

// TODO improve DOCSTRINGS by adding what they will return 
/** Get request to get all the invoices  */
invoicesRouter.get('/', async function (req, res, next) {
    try {
        // TODO fix variable singular/plural, more descriptive names
        const result = await db.query(`SELECT id, comp_code FROM invoices`)
        const invoices = results.rows

        // Throw error instead - actually, no. [] truthy. return empty
        if (!invoices) return res.json({ message: "There are no invoices" })
        else return res.json({ invoices })

    } catch (err) {
        return next(err)
    }
})


/** Get request to get a invoice */
invoicesRouter.get('/:id', async function (req, res, next) {
    try {
        const id = Number(req.params.id)

        const invoiceResults = await db.query(
            `SELECT id, comp_code, amt, 
                paid, add_date, paid_date 
            FROM invoices WHERE id = $1`,
        [id])

        // Check for .length
        if (!invoiceResults.rows) throw new NotFoundError()
        const invoice = invoiceResults.rows[0]

        const code = invoice.comp_code

        const companyResults = await db.query(`SELECT code, name, description FROM companies WHERE code = $1`, [code])

        delete invoice.comp_code
        invoice.company = companyResults.rows

        return res.json({ invoice })
    } catch (err) {
        return next(err)
    }
})

/**Post request to create an invoice */
invoicesRouter.post('/', async function (req, res, next) {
    try {
        const { comp_code, amt } = req.body

        const results = await db.query(
            `INSERT INTO invoices (comp_code, amt) 
            VALUES ($1, $2)                        
            RETURNING id, comp_code, amt, paid, 
                        add_date, paid_date`,
            [comp_code, amt])

        const invoice = results.rows[0]
        // if (!invoice) throw new BadRequestError()

        return res.json({ invoice })
    } catch (err) {
        return next(err)
    }
})

// PUT because we are returning the entire object
/** Updates an invoice. Accepts invoice id as url param */
invoicesRouter.put('/:id', async function (req, res, next) {
    try {
        const id = req.params.id;
        const { amt } = req.body;

        const result = await db.query(
            `UPDATE invoices
            SET amt = $2
            WHERE id = $1
            RETURNING id, comp_code, amt, paid, 
                        add_date, paid_date`,
            [id, amt]);
        const invoice = result.rows[0];

        if (!invoice) throw new NotFoundError();
        return res.json({ invoice });

    } catch (err) {
        return next(err);
    }
});

/** Delete request for a particular invoice. Accepts invoice id as url param */
invoicesRouter.delete('/:id', async function (req, res, next) {
    try {
        const id = req.params.id;
        const result = await db.query(
            `DELETE FROM invoices
            WHERE id = $1
            RETURNING comp_code`,
            [id])

        const compName = result.rows[0].comp_code
        // if (!result) throw new NotFoundError(); TODO add NotFound msg
        return res.json({ status: `Deleted Invoice for ${compName}` });
    } catch (err) {
        return next(err);
    }
})



module.exports = invoicesRouter