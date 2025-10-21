import customerService from '../services/CustomerService.js';

class CustomerController {
  async create(req, res, next) {
    try {
      const customerData = req.body;
      const customer = await customerService.create(customerData);
      
      return res.status(201).json({
        success: true,
        message: 'Cliente criado com sucesso',
        data: customer
      });
    } catch (error) {
      next(error);
    }
  }

  async findAll(req, res, next) {
    try {
      const customers = await customerService.findAll();
      
      return res.status(200).json({
        success: true,
        data: customers,
        count: customers.length
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(req, res, next) {
    try {
      const { id } = req.params;
      const customer = await customerService.findById(id);
      
      return res.status(200).json({
        success: true,
        data: customer
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await customerService.delete(id);
      
      return res.status(200).json({
        success: true,
        message: 'Cliente removido com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CustomerController();

