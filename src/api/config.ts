import ajax from '@/ajax';

export const book = {
  getBookDetail: ajax.post('/book/detail', {autoHandleCode: true}),
};
