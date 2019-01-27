import Route from 'express';
import CrawlCtl from '../controllers/crawler.controller';

const router = new Route();

router.get('/siteMuaBanNet/:page', CrawlCtl.getData);

export default router;