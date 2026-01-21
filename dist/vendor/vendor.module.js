"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorModule = void 0;
const common_1 = require("@nestjs/common");
const queue_1 = require("../queue");
const vendor_a_service_1 = require("./services/vendors/vendor-a.service");
const vendor_b_service_1 = require("./services/vendors/vendor-b.service");
const vendor_factory_1 = require("./services/vendor.factory");
const vendor_adapter_service_1 = require("./services/vendor-adapter.service");
const vendor_queues_constant_1 = require("./constants/vendor-queues.constant");
let VendorModule = class VendorModule {
};
exports.VendorModule = VendorModule;
exports.VendorModule = VendorModule = __decorate([
    (0, common_1.Module)({
        providers: [
            vendor_a_service_1.VendorAService,
            vendor_b_service_1.VendorBService,
            vendor_factory_1.VendorFactory,
            {
                provide: 'IVendorAdapter',
                useClass: vendor_adapter_service_1.VendorAdapterService,
            },
            // Vendor A Queue
            {
                provide: vendor_queues_constant_1.VENDOR_QUEUE_TOKENS.VENDOR_A_QUEUE,
                useFactory: (queueConfig) => {
                    return queueConfig.createQueue({
                        name: vendor_queues_constant_1.VENDOR_QUEUE_NAMES.VENDOR_A_BOOKINGS,
                        defaultJobOptions: queueConfig.getVendorBookingJobOptions(),
                    });
                },
                inject: [queue_1.QueueConfigService],
            },
            // Vendor B Queue
            {
                provide: vendor_queues_constant_1.VENDOR_QUEUE_TOKENS.VENDOR_B_QUEUE,
                useFactory: (queueConfig) => {
                    return queueConfig.createQueue({
                        name: vendor_queues_constant_1.VENDOR_QUEUE_NAMES.VENDOR_B_BOOKINGS,
                        defaultJobOptions: queueConfig.getVendorBookingJobOptions(),
                    });
                },
                inject: [queue_1.QueueConfigService],
            },
        ],
        exports: [
            'IVendorAdapter',
            vendor_queues_constant_1.VENDOR_QUEUE_TOKENS.VENDOR_A_QUEUE,
            vendor_queues_constant_1.VENDOR_QUEUE_TOKENS.VENDOR_B_QUEUE,
        ],
    })
], VendorModule);
//# sourceMappingURL=vendor.module.js.map