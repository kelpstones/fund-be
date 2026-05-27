const { blockScanners } = require("../../../src/middlewares/antiScanner");

describe("AntiScanner Middleware Unit Tests", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      path: "",
      method: "GET",
      originalUrl: "",
      ip: "127.0.0.1",
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it("should block suspicious path containing php extension", () => {
    req.path = "/api/vendor/phpunit/phpunit/src/Util/PHP/eval-stdin.php";
    req.originalUrl = "/api/vendor/phpunit/phpunit/src/Util/PHP/eval-stdin.php";

    blockScanners(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "fail",
        statusCode: 403,
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("should block suspicious path containing wp-admin", () => {
    req.path = "/wp-admin/index.php";
    req.originalUrl = "/wp-admin/index.php";

    blockScanners(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("should block suspicious path containing phpunit", () => {
    req.path = "/vendor/phpunit/phpunit/src/Util/PHP/eval-stdin";
    req.originalUrl = "/vendor/phpunit/phpunit/src/Util/PHP/eval-stdin";

    blockScanners(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("should allow legitimate path", () => {
    req.path = "/api/v1/pengajuans";
    req.originalUrl = "/api/v1/pengajuans";

    blockScanners(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
