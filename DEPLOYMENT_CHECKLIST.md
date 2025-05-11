# Deployment Checklist

## Pre-Deployment Checks

### Code Quality
- [ ] All linting issues resolved
- [ ] Code formatting is consistent
- [ ] No console.log statements in production code
- [ ] No commented-out code

### Testing
- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing of affected features completed
- [ ] Cross-browser testing completed

### Feature-Specific Checks
- [ ] Orders feature fully functional
  - [ ] Order list loads correctly
  - [ ] Order details page works
  - [ ] Create order form works
  - [ ] Edit order functionality works
  
- [ ] Courier Orders feature fully functional
  - [ ] Courier order list loads correctly
  - [ ] Courier order details page works
  - [ ] Create courier order form works
  
- [ ] Navigation works correctly for all features
  - [ ] Orders navigation links work
  - [ ] Courier Orders navigation links work
  - [ ] No broken links

### Performance
- [ ] Bundle size is acceptable
- [ ] Page load times are acceptable
- [ ] No memory leaks identified

## Deployment Process

1. **Feature Flags**
   - [ ] Set appropriate feature flags for new features
   - [ ] Ensure old code paths are preserved for rollback

2. **Deployment Steps**
   - [ ] Deploy to staging environment first
   - [ ] Verify all functionality in staging
   - [ ] Deploy to production during low-traffic period
   - [ ] Monitor error rates after deployment

3. **Post-Deployment**
   - [ ] Verify critical paths in production
   - [ ] Monitor performance metrics
   - [ ] Check error logs for new errors

## Rollback Plan

If issues are detected:

1. Disable problematic features using feature flags
2. If necessary, roll back to previous version
3. Document the issue and create a plan to fix

## Feature-Specific Considerations

### When Modifying Order Details
- [ ] Verify that Courier Orders are not affected
- [ ] Check that navigation between features works
- [ ] Ensure shared components still work for both features

### When Modifying Courier Orders
- [ ] Verify that Order Details are not affected
- [ ] Check that navigation between features works
- [ ] Ensure shared components still work for both features
