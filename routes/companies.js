//import express
const express = require("express");

//import other files/functions you will uses
const db = require("../db");

//create your router
const companiesRouter = express.Router();

const { NotFoundError } = require("../expressError");


//get all companies
companiesRouter.get("/", async function (req, res, next) {
  try {
    const results = await db.query(
      `SELECT code, name
        FROM companies`);
    const companies = results.rows
    return res.json({ companies });

  } catch (err) {
    return next(err);
  }
});

//get a company
companiesRouter.get("/:code", async function (req, res, next) {
  try {
    const code = req.params.code

    const results = await db.query(
      `SELECT code, name, description
      FROM companies Where code = $1`,
      [code]);
    const company = results.rows[0]

    if (!company) throw new NotFoundError();

    // Get all invoices for this company
    const invoices = await db.query(
      `SELECT id, comp_code, amt, paid, add_date, paid_date
      FROM invoices
      WHERE comp_code = $1`,
      [code]);

    company.invoices = invoices.rows;

    return res.json({ company });

  } catch (err) {
    return next(err);
  }
});

//post request to add a company
companiesRouter.post("/", async function (req, res, next) {
  console.log("creating a comp")
  try {
    const { code, name, description } = req.body;
    console.log("req ", req.body)

    const results = await db.query(
      `INSERT INTO companies (code, name, description)
        VALUES ($1, $2, $3) 
        RETURNING code, name, description`,
      [code, name, description]);

    const company = results.rows[0]

    return res.status(201).json({ company });
  } catch (err) {
    return next(err);
  }
});


/**  Put request - edit an existing company */
companiesRouter.put('/:code', async function (req, res, next) {
  try {
    const { name, description } = req.body;
    const code = req.params.code;

    const results = await db.query(
      `UPDATE companies
            SET name = $1,
                description = $2
            WHERE code = $3
            RETURNING code, name, description`,
      [name, description, code]);
    const company = results.rows[0];

    if (!company) throw new NotFoundError();
    return res.json({ company });

  } catch (err) {
    return next(err);
  }
});

/** Delete request - delete an existing company */
companiesRouter.delete('/:code', async function (req, res, next) {
  try {
    const code = req.params.code;

    const results = await db.query(
      `DELETE FROM companies 
            WHERE code = $1
            RETURNING code, name`,
      [code]);
    const deletedCompany = results.rows[0];
    console.log('deletedCompany', deletedCompany);

    if (!deletedCompany) throw new NotFoundError();

    return res.json({ message: `Deleted ${deletedCompany.name}` });

  } catch (err) {
    return next(err);
  }
})

//Export router
module.exports = companiesRouter;