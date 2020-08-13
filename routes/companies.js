//import express
const express = require("express");

//import other files/functions you will uses
const db = require("../db");

//create your router
const companiesRouter = express.Router();


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
    let code = req.params.code // Is it json or params?
    const results = await db.query(
        `SELECT code, name, description
        FROM companies Where code = $1`, [code]);
    const company = results.rows[0]
    return res.json({ company });

  } catch (err) {
    return next(err);
  }
});

//post request to add a company
companiesRouter.post("/", async function (req, res, next) {
  console.log("creating a comp")
  try {
    let code = req.body.code // Is it json or params?
    let name = req.body.name
    let description = req.body.description
    console.log("req ", req.body)
    const results = await db.query(
        `INSERT INTO companies (code, name, description)
        VALUES ($1, $2, $3) RETURNING code, name, description`, [code, name, description]);
    const company = results.rows[0]
    return res.status(201).json({ company });

  } catch (err) {
    return next(err);
  }
});

//Export router
module.exports = companiesRouter;