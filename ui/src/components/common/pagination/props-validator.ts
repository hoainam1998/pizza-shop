export default {
  pageSize: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  pagerCount: {
    type: [String, Number],
    default: 11,
    validator(value: number) {
      return value > 6;
    },
  },
};
