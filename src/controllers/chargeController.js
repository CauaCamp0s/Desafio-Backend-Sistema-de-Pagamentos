import chargeService from '../services/chargeService.js';

class ChargeController {
  async create(req, res) {
    try {
      const chargeData = req.body;
      const charge = await chargeService.create(chargeData);
      
      return res.status(201).json({
        success: true,
        message: 'Cobrança criada com sucesso',
        data: charge
      });
    } catch (error) {
      if (error.status) {
        return res.status(error.status).json({
          success: false,
          message: error.message,
          errors: error.errors || []
        });
      }

      console.error('Erro ao criar cobrança:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async findAll(req, res) {
    try {
      const charges = await chargeService.findAll();
      
      return res.status(200).json({
        success: true,
        data: charges,
        count: charges.length
      });
    } catch (error) {
      console.error('Erro ao listar cobranças:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async findById(req, res) {
    try {
      const { id } = req.params;
      const charge = await chargeService.findById(id);
      
      return res.status(200).json({
        success: true,
        data: charge
      });
    } catch (error) {
      if (error.status) {
        return res.status(error.status).json({
          success: false,
          message: error.message
        });
      }

      console.error('Erro ao buscar cobrança:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

export default new ChargeController();

