// Performance utilities

const Utils = {
  // Debounce function - prevents function from being called too frequently
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle function - ensures function is called at most once per interval
  throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Request animation frame wrapper for batch DOM updates
  batchDOMUpdate(callback) {
    if (window.requestAnimationFrame) {
      requestAnimationFrame(callback);
    } else {
      callback();
    }
  },

  // Douglas-Peucker line simplification algorithm
  simplifyPath(points, tolerance = 0.0001) {
    if (points.length <= 2) return points;

    const sqTolerance = tolerance * tolerance;

    // Find the point with maximum distance
    let maxDistance = 0;
    let index = 0;

    for (let i = 1; i < points.length - 1; i++) {
      const distance = this.perpendicularDistance(
        points[i],
        points[0],
        points[points.length - 1]
      );

      if (distance > maxDistance) {
        maxDistance = distance;
        index = i;
      }
    }

    // If max distance is greater than tolerance, recursively simplify
    if (maxDistance > sqTolerance) {
      const left = this.simplifyPath(points.slice(0, index + 1), tolerance);
      const right = this.simplifyPath(points.slice(index), tolerance);

      return left.slice(0, -1).concat(right);
    } else {
      return [points[0], points[points.length - 1]];
    }
  },

  // Calculate perpendicular distance from point to line
  perpendicularDistance(point, lineStart, lineEnd) {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.z - lineStart.z;

    const mag = dx * dx + dy * dy;
    if (mag === 0) return this.distanceSquared(point, lineStart);

    const u = ((point.x - lineStart.x) * dx + (point.z - lineStart.z) * dy) / mag;

    if (u < 0) return this.distanceSquared(point, lineStart);
    if (u > 1) return this.distanceSquared(point, lineEnd);

    const intersection = {
      x: lineStart.x + u * dx,
      z: lineStart.z + u * dy
    };

    return this.distanceSquared(point, intersection);
  },

  distanceSquared(p1, p2) {
    const dx = p1.x - p2.x;
    const dz = p1.z - p2.z;
    return dx * dx + dz * dz;
  }
};

window.Utils = Utils;
