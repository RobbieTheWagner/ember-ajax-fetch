import Application from 'dummy/app';
import config from 'dummy/config/environment';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';

import QUnit from 'qunit';
import td from 'testdouble';
import installVerifyAssertion from 'testdouble-qunit';

installVerifyAssertion(QUnit, td);

setApplication(Application.create(config.APP));

start();
