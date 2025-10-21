import chargeService from '../services/chargeService.js';

class ChargeController {
  async create(req, res, next) {
    try {
      const chargeData = req.body;
      const charge = await chargeService.create(chargeData);
      
      return res.status(201).json({
        success: true,
        message: 'Cobrança criada com sucesso',
        data: charge
      });
    } catch (error) {
      next(error);
    }
  }

  async findAll(req, res, next) {
    try {
      const charges = await chargeService.findAll();
      
      return res.status(200).json({
        success: true,
        data: charges,
        count: charges.length
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(req, res, next) {
    try {
      const { id } = req.params;
      const charge = await chargeService.findById(id);
      
      return res.status(200).json({
        success: true,
        data: charge
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ChargeController();

