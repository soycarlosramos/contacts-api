import pool from '../db/pool.js'

const createContact = async (req, res) => {
  const { body, uuid } = req
  const { name, number } = body
  const params = [name, number]

  if (params.some(p => p === undefined || p === null || !String(p.length))) {
    res
      .status(400)
      .header({ 'Content-Type': 'application/json' })
      .json({
        status: 'error',
        code: 400,
        title: 'BAD_REQUEST',
        message: 'All parameters are required',
        meta: {
          _timestamp: parseInt(Date.now() / 1000),
          _requestId: uuid,
          _requestPath: req.baseUrl + req.path,
        },
      })
    return
  }

  try {
    const [rows] = await pool.query('SELECT * FROM contacts WHERE number = ?', number)

    if (rows.length) {
      res
        .status(409)
        .header({ 'Content-Type': 'application/json' })
        .json({
          status: 'error',
          code: 409,
          title: 'CONFLICT',
          message: 'Resource already exists',
          meta: {
            _timestamp: parseInt(Date.now() / 1000),
            _requestId: uuid,
            _requestPath: req.baseUrl + req.path,
          },
        })
      return
    }

    const [{ insertId: id }] = await pool.query('INSERT INTO contacts (name, number) VALUES (?, ?)', params)

    res
      .status(201)
      .header({ 'Content-Type': 'application/json' })
      .json({
        status: 'success',
        code: 201,
        title: 'CREATED',
        message: 'Resource created successfully',
        data: {
          contact: {
            id,
            name,
            number
          }
        },
        meta: {
          _timestamp: parseInt(Date.now() / 1000),
          _requestId: uuid,
          _requestPath: req.baseUrl + req.path,
        },
      })

    return
  } catch (e) {
    console.error(e)
    res
      .status(500)
      .header({ 'Content-Type': 'application/json' })
      .json({
        status: 'error',
        code: 500,
        title: 'INTERNAL_SERVER_ERROR',
        message: 'Something went wrong',
        meta: {
          _timestamp: parseInt(Date.now() / 1000),
          _requestId: uuid,
          _requestPath: req.baseUrl + req.path,
        },
      })
    return
  }
}

export default createContact
