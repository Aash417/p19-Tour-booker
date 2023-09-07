const Tour = require('./../models/tourModel');
const APIFeature = require('./../utils/apiFeatures');

// alias tours
exports.aliasTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingAverage,price';
  req.query.fields = 'name,price,ratingAverage,summary,difficulty';
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    // 5. Execute the query
    const features = new APIFeature(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const tours = await features.query;

    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: tours.length,
      data: {
        tours
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'failed',
      message: error
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    // Tour.findOne({ _id: req.params.id });
    const tour = await Tour.findById(req.params.id);

    res.status(200).json({
      status: 'successful',
      data: {
        tour
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    // const newTour = new Tour({})
    // newTour.save()

    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
    console.log('Updated Successfully');
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success deleted',
      data: null
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error
    });
  }
};

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingAverage: { $gt: 4.4 } }
      },
      {
        $group: {
          _id: '$difficulty',
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingQuantity' },
          avgRating: { $avg: '$ratingAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      },
      {
        $sort: { avgPrice: 1 }
      }
      //   {
      //     $match: { _id: { $ne: 'easy' } }
      //   }
    ]);
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      data: {
        stats
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'failed',
      message: error
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1;

    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates'
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numtourStarts: { $sum: 1 },
          tours: { $push: '$name' }
        }
      },
      {
        $addFields: { month: '$_id' }
      },
      {
        $project: { _id: 0 }
      },
      {
        $sort: { numtourStarts: -1 }
      }
      //   ,{ $limit: 5 }
    ]);

    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      result: plan.length,
      data: {
        plan
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'failed',
      message: error
    });
  }
};
