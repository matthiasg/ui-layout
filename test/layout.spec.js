'use strict';

describe('uiLayout', function () {

  // declare these up here to be global to all tests
  var scope, $compile, element;

  /**
   * UTILS
   */

  function appendTemplate(tpl) {
    element = angular.element(tpl);
    angular.element(document.body).append(element);
    $compile(element)(scope);
    scope.$digest();
  }

  /**
   * TESTS
   */

  beforeEach(module('ui.layout'));

  // inject in angular constructs. Injector knows about leading/trailing underscores and does the right thing
  // otherwise, you would need to inject these into each test
  beforeEach(inject(function (_$rootScope_, _$compile_) {
    scope = _$rootScope_.$new();
    $compile = _$compile_;
  }));


  // jasmine matcher for expecting an element to have a css class
  // https://github.com/angular/angular.js/blob/master/test/matchers.js
  beforeEach(function () {
    this.addMatchers({
      toHaveClass: function (cls) {
        this.message = function () {
          return 'Expected "' + angular.mock.dump(this.actual) + '" to have class "' + cls + '".';
        };

        return this.actual.hasClass(cls);
      }
    });
  });

  describe('require', function () {
    it('requestAnimationFrame', function () {
      expect(window.requestAnimationFrame).toBeDefined();
    });
    it('cancelAnimationFrame', function () {
      expect(window.cancelAnimationFrame).toBeDefined();
    });
  });

  afterEach(function () {
    if (element) element.remove();
  });

  describe('directive', function () {

    it('should have a "stretch" class', function () {
      appendTemplate('<div ui-layout></div>');
      expect(element).toHaveClass('stretch');
    });

    it('should work as an element', function () {
      appendTemplate('<ui-layout></ui-layout>');
      expect(element).toHaveClass('stretch');
    });

    it('should work as an attribute', function () {
      appendTemplate('<div ui-layout></div>');
      expect(element).toHaveClass('stretch');
    });

    it('should have a "ui-layout-row" class by default', function () {
      appendTemplate('<div ui-layout></div>');
      expect(element).toHaveClass('ui-layout-row');
    });

    it('should not add split bar when empty', function () {
      appendTemplate('<div ui-layout></div>');
      expect(element.children().length).toEqual(0);
    });

    it('should not add split bar when only one area', function () {
      appendTemplate('<div ui-layout><section></section></div>');
      expect(element.children().length).toEqual(1);
    });

    it('should add n-1 split bar pour n area', function () {
      var children, splitBarElm;

      // Try with 2 elements
      appendTemplate('<div ui-layout><article></article><section></section></div>');
      children = element.children();
      expect(children.length).toEqual(2 + 1); // add one slide
      expect(children[0].tagName).toEqual('ARTICLE');

      splitBarElm = children.eq(1);
      expect(splitBarElm[0].tagName).toEqual('DIV');
      expect(splitBarElm).toHaveClass('ui-splitbar');

      expect(children[2].tagName).toEqual('SECTION');

      // Try with 4 elements
      element.remove();
      appendTemplate('<div ui-layout><header></header><article></article><section></section><footer></footer></div>');
      children = element.children();
      expect(children.length).toEqual(4 + 3); // add three slide

      // Raw pluck
      function _pluck(col, prop) {
        var _r = [];
        for (var i = 0; i < col.length; i++) {
          _r[i] = col[i][prop];
        }
        return _r;
      }

      expect(_pluck(children, 'tagName')).toEqual(['HEADER', 'DIV', 'ARTICLE', 'DIV', 'SECTION', 'DIV', 'FOOTER']);

    });


    describe('size option', function () {

      function testSizeNotation(notation, middlePosition){
        appendTemplate('<div ui-layout><header size="' + notation + '"></header><footer></footer></div>');
        expect(element.children().eq(0)[0].style.top).toEqual('0%');
        expect(element.children().eq(0)[0].style.bottom).toEqual( (100 - middlePosition || 50) + '%');
        expect(element.children().eq(1)[0].style.top).toEqual( (middlePosition || 50) + '%');
        expect(element.children().eq(1)[0].style.bottom).toEqual('');
        element.remove();
      }

      describe('should only support pixels and pencent data type', function () {
        var wtfSizes = ['fuu', '  ', 'wtf10', '10wtf', '12', '12ppx', '12px%', '12px %'];
        for (var _i = 0, n = wtfSizes.length ; _i < n ; ++_i){
          (function(notation){ // Use a new scope
            it('"' + notation + '" should be handled as auto', function () {
              testSizeNotation(notation);
            });
          })(wtfSizes[_i]);
        }
      });

      it('should support percent type', function () {
        testSizeNotation('10%', 10);
      });

      it('should support pixel type', function () {
        appendTemplate('<div ui-layout><header size="10px"></header><footer></footer></div>');
        var expectedMiddle =  (10 / _jQuery(element[0]).height() * 100).toFixed(5);
        expect(element.children().eq(0)[0].style.top).toEqual('0%');
        expect(element.children().eq(0)[0].style.bottom).toEqual( (100 - expectedMiddle ) + '%');
        expect(element.children().eq(1)[0].style.top).toEqual( expectedMiddle + '%');
        expect(element.children().eq(1)[0].style.bottom).toEqual('');
      });

      it('should handle useless spaces', function () {
        testSizeNotation('    10%', 10);
        testSizeNotation('10%    ', 10);
        testSizeNotation('  10%  ', 10);
        testSizeNotation(' 10  % ', 10);
      });

    });

    describe('in column flow', function () {

      describe('when using no options', function () {
        beforeEach(function () {
          appendTemplate('<div ui-layout="{ flow : \'column\' }"><header></header><footer></footer></div>');
        });

        it('should have a "ui-layout-column" class', function () {
          expect(element).toHaveClass('ui-layout-column');
        });

        it('should initialise with equal width', function () {
          expect(element.children().eq(0)[0].style.left).toEqual('0%');
          expect(element.children().eq(0)[0].style.right).toEqual('50%');
          expect(element.children().eq(1)[0].style.left).toEqual('50%');
          expect(element.children().eq(1)[0].style.right).toEqual('');
        });

        it('should have a split bar at the middle', function () {
          expect(element.children().eq(1)[0].style.left).toEqual('50%');
        });
      });

      it('should initialise the header width to 10%', function () {
        appendTemplate('<div ui-layout="{ flow : \'column\' }"><header size="10%"></header><footer></footer></div>');
        expect(element.children().eq(1)[0].style.left).toEqual('10%');
      });
    });


    describe('in row flow', function () {

      beforeEach(function () {
        appendTemplate('<div ui-layout><header></header><footer></footer></div>');
      });

      it('should have a "ui-layout-row" class by default', function () {
        expect(element).toHaveClass('ui-layout-row');
      });

      it('should initialise with equal height', function () {
        var firstElemHeight = element.children()[0].getBoundingClientRect().height;
        for (var i = 0; i < element.children().length; i+=2) {
          expect(element.children()[i].getBoundingClientRect().height, 'tagName').toEqual(firstElemHeight);
        }
      });

      it('should have a split bar at the middle', function () {
        expect(element.children().eq(1)[0].style.top).toEqual('50%');
      });
    });

  });


  describe('controller', function () {
    var ctrl;

    beforeEach(inject(function (_$controller_) {
      appendTemplate('<div ui-layout="{ flow : \'row\' }"></div>');
      ctrl = _$controller_('uiLayoutCtrl', { $scope: scope, $element: element, $attrs: element[0].attributes });
    }));

    it('should expose the options and the element', function () {
      expect(ctrl).toEqual({ opts: jasmine.any(Object), element: element });
    });
  });

});
