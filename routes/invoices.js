//import express
const express = require("express");

//import other files/functions you will uses
const db = require("../db");

//create your router
const invoicesRouter = express.Router();

const { NotFoundError, BadRequestError } = require("../expressError");


/** Get request to get all the invoices  */
invoicesRouter.get('/', async function(req, res, next){
    try{
        const results = await db.query(`SELECT id, comp_code FROM invoices`)
        const invoices = results.rows

        if (!invoices) return res.json({message : "There are no invoices"})
        else return res.json({invoices})

    }catch(err){
        return next(err)
    } 
})

/** Get request to get a invoice */
invoicesRouter.get('/:id', async function(req, res, next){
    try{
        const id = Number(req.params.id)

        const invoiceResults = await db.query(`SELECT id, comp_code, amt, paid, add_date, paid_date FROM invoices WHERE id = $1`, [id])

        if(!invoiceResults.rows) throw new NotFoundError()
        const invoice = invoiceResults.rows[0]

        const code =invoice.comp_code

        const companyResults = await db.query(`SELECT code, name, description FROM companies WHERE code = $1`, [code]) // TOASK :Why not ${code} instead of $1

        delete invoice.comp_code
        invoice.company = companyResults.rows

        return res.json({invoice})
    }catch(err){
        return next(err)
    }
})

/**Post request to create an invoice */
invoicesRouter.post('/', async function(req, res, next){
    try{
        // const comp_code = req.body.comp_code
        // const amt = Number(req.body.amt)
        const {comp_code, amt} = req.body //TOASK : Is db converting string to number ?
       
        const results = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ($1, $2)
                                    RETURNING id, comp_code, amt, paid, add_date, paid_date`, [comp_code, amt])
        
        const invoice = results.rows[0]
        if(!invoice) throw new BadRequestError()

        return res.json({invoice})
    }catch(err){
        return next(err)
    }
})

module.exports = invoicesRouter