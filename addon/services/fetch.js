
import Service from '@ember/service';
import FetchRequestMixin from '../mixins/fetch-request';

const FetchService = Service.extend(FetchRequestMixin);

export default FetchService;
