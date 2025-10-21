import customerService from '../services/CustomerService.js';

class CustomerController {
  async create(req, res) {
    try {
      const customerData = req.body;
      const customer = await customerService.create(customerData);
      
      return res.status(201).json({
        success: true,
        message: 'Cliente criado com sucesso',
        data: customer
      });
    } catch (error) {
      if (error.status) {
        return res.status(error.status).json({
          success: false,
          message: error.message,
          errors: error.errors || []
        });
      }

      console.error('Erro ao criar cliente:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async findAll(req, res) {
    try {
      const customers = await customerService.findAll();
      
      return res.status(200).json({
        success: true,
        data: customers,
        count: customers.length
      });
    } catch (error) {
      console.error('Erro ao listar clientes:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async findById(req, res) {
    try {
      const { id } = req.params;
      const customer = await customerService.findById(id);
      
      return res.status(200).json({
        success: true,
        data: customer
      });
    } catch (error) {
      if (error.status) {
        return res.status(error.status).json({
          success: false,
          message: error.message
        });
      }

      console.error('Erro ao buscar cliente:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      await customerService.delete(id);
      
      return res.status(200).json({
        success: true,
        message: 'Cliente removido com sucesso'
      });
    } catch (error) {
      if (error.status) {
        return res.status(error.status).json({
          success: false,
          message: error.message
        });
      }

      console.error('Erro ao remover cliente:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

export default new CustomerController();

