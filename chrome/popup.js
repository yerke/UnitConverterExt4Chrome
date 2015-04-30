var Converter = {
  init: function init() {
    //console.log('got to init');
    // populate categories
    Converter.addCategories();

    // populate units
    Converter.changeCategory();

    // add listeners
    $('#from').on('keyup', null, {source: '#from', target: '#to'}, Converter.convert);
    $('#from_units').on('change', null, {source: '#from', target: '#to'}, Converter.convert);
    $('#to').on('keyup', null, {source: '#to', target: '#from'}, Converter.convert);
    $('#to_units').on('change', null, {source: '#from', target: '#to'}, Converter.convert);
    $('#conv_btn').on('click', null, {source: '#from', target: '#to'}, Converter.convert);
    $('#category').on('change', null, {}, Converter.changeCategory);
    $('#switch_btn').on('click', null, {}, Converter.switchUnits);

    // paste events
    // setTimeout is needed because before the delay the old value is still there
    $('#from').on('paste', function () {
      setTimeout(function () {
        Converter.convert({data: {source: '#from', target: '#to'}});
      }, 100);
    });
    $('#to').on('paste', function () {
      setTimeout(function () {
        Converter.convert({data: {source: '#to', target: '#from'}});
      }, 100);
    });
  },

  convert: function(e) {
    //console.log('got to convert');
    var source = e ? e.data.source : '#from';
    var target = e ? e.data.target : '#to';
    var sunits = $(source+'_units').val();
    var tunits = $(target+'_units').val();
    $(target).val(Converter.getValue($(source).val(), sunits, tunits));
    //$('#message').html(sunits + ' -> ' + tunits);
  },

  getValue: function(sourceValue, sunits, tunits) {
    //console.log('got to getValue');
    // $('#message').html(sourceValue + ' ' + sunits + ' -> ' + tunits);
    //console.log(this);
    //return sourceValue/Converter.getUnitValue(sunits)*Converter.getUnitValue(tunits);
    return Converter.getUnitValue(Converter.getUnitValue(sourceValue, sunits, true), tunits, false);
  },

  getUnitValue: function(value, unit, to_base) {
    //console.log('got to getUnitValue');
    var convert = Converter.UnitTable[unit];
    to_base = to_base || false;
    if (typeof(convert) == "function") {
      return convert(value, to_base);
    }
    else {
      return to_base ? convert * value : value / convert;
    }
    //return Converter.UnitTable[unit];
  },

  UnitTable: {
  },

  CategoryTable: {
    length: {
      base_unit: 'meter',
      UnitTable: {
        kilometer: 1000,
        meter: 1,
        centimeter: 0.01,
        millimeter: 0.001,
        mile: 1609.344,
        yard: 0.9144,
        foot: 0.3048,
        inches: 0.0254,
        'nautical mile': 1852
      },
      default_from_index: 1,
      default_to_index: 6
    },
    temperature: {
      base_unit: 'celsuis',
      UnitTable: {
        celsuis: 1,
        fahrenheit: function (value, to_base) {
          to_base = to_base || false;
          return to_base ? ((value - 32) * 5/9) : (32 + value * 9/5);
        },
        kelvin: function (value, to_base) {
          to_base = to_base || false;
          return to_base ? (value - 273.15) : (value + 273.15);
        },
        rankine: function (value, to_base) {
          to_base = to_base || false;
          return to_base ? ((value - 491.67) * 5/9) : ((value + 273.15) * 9/5);
        }
      },
      default_from_index: 0,
      default_to_index: 1
    },
    area: {
      base_unit: 'square meter',
      UnitTable: {
        'square km': 1000000,
        hectare: 10000,
        'square meter': 1,
        'square mile': 2589988.110336,
        acre: 4046.8564224,
        'square yard': 0.83612736,
        'square foot': 0.09290304,
        'square inch': 0.00064516
      },
      default_from_index: 0,
      default_to_index: 1
    },
    volume: {
      base_unit: 'cubic meter',
      UnitTable: {
        'US gal': 0.003785411784,
        'US quart': 0.000946352946,
        'US pint': 0.000473176473,
        'US cup': 0.0002365882365,
        'US oz': 0.0000295735295625,
        'US tbsp.': 0.0000147867647825,
        'US tsp.': 0.000004928921595,
        'cubic meter': 1,
        liter: 0.001,
        milliliter: 0.000001,
        'imperial gal': 0.00454609,
        'imperial quart': 0.0011365225,
        'imperial pint': 0.00056826125,
        'imperial oz': 0.0000284130625,
        'imperial tbsp.': 0.0000177581640625,
        'imperial tsp.': 0.00000591938802083,
        'cubic foot': 0.028316846592,
        'cubic inch': 0.000016387064,
      },
      default_from_index: 0,
      default_to_index: 8
    },
    weight: {
      base_unit: 'kilogram',
      UnitTable: {
        'metric ton': 1000,
        kilogram: 1,
        gram: 0.001,
        milligram: 0.000001,
        'long ton': 2240*0.45359237,
        'short ton': 2000*0.45359237,
        stone: 6.35029318,
        pound: 0.45359237,
        ounce: 0.028349523125
      },
      default_from_index: 1,
      default_to_index: 7
    },
    time: {
      base_unit: 'second',
      UnitTable: {
        nanosecond: 0.000000001,
        microsecond: 0.000001,
        millisecond: 0.001,
        second: 1,
        minute: 60,
        hour: 3600,
        day: 86400,
        week: 604800,
        month: 2629746,
        year: 31556952,
        decade: 315569520,
        century: 3155695200
      },
      default_from_index: 7,
      default_to_index: 4
    }
  },

  changeCategory: function() {
    var newCategory = $('#category').val();
    //console.log('The new category: ' + newCategory);
    Converter.UnitTable = Converter.CategoryTable[newCategory].UnitTable;

    $('#from_units option').remove();
    $('#to_units option').remove();
    var i = 0;
    var default_from_index = Converter.CategoryTable[newCategory].default_from_index;
    var default_to_index = Converter.CategoryTable[newCategory].default_to_index;
    for (key in Converter.UnitTable) {
      $('#from_units').append('<option value="'+ key +'"'+ (i===default_from_index ? ' selected' : '') +'>'+ key.charAt(0).toUpperCase() + key.slice(1) +'</option>');
      $('#to_units').append('<option value="'+ key +'"'+ (i===default_to_index ? ' selected' : '') +'>'+ key.charAt(0).toUpperCase() + key.slice(1) +'</option>');
      i++;
    }

    Converter.convert();
  },

  addCategories: function() {
    for (key in Converter.CategoryTable) {
      $('#category').append('<option value="'+ key +'">'+ key.charAt(0).toUpperCase() + key.slice(1) +'</option>');
    }
  },

  switchUnits: function() {
    var from_units = $('#from_units');
    var to_units = $('#to_units');
    var from_units_val = from_units.val();
    var to_units_val = to_units.val();
    from_units.val(to_units_val);
    to_units.val(from_units_val);

    var from = $('#from');
    var to = $('#to');
    var from_val = from.val();
    var to_val = to.val();
    from.val(to_val);
    to.val(from_val);

    Converter.convert();
  }
};

$('document').ready(function () {
    Converter.init();
  });
