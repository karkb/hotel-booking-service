"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BullBoardModule = exports.BullBoardService = void 0;
const common_1 = require("@nestjs/common");
const api_1 = require("@bull-board/api");
const bullMQAdapter_1 = require("@bull-board/api/bullMQAdapter");
const express_1 = require("@bull-board/express");
const common_2 = require("@nestjs/common");
const bullmq_1 = require("bullmq");
const vendor_module_1 = require("../../vendor/vendor.module");
let BullBoardService = class BullBoardService {
    constructor(vendorAQueue, vendorBQueue, postBookingQueue) {
        this.vendorAQueue = vendorAQueue;
        this.vendorBQueue = vendorBQueue;
        this.postBookingQueue = postBookingQueue;
        this.serverAdapter = new express_1.ExpressAdapter();
        this.serverAdapter.setBasePath('/admin/queues/ui');
        (0, api_1.createBullBoard)({
            queues: [
                new bullMQAdapter_1.BullMQAdapter(this.vendorAQueue),
                new bullMQAdapter_1.BullMQAdapter(this.vendorBQueue),
                new bullMQAdapter_1.BullMQAdapter(this.postBookingQueue),
            ],
            serverAdapter: this.serverAdapter,
        });
    }
    getRouter() {
        return this.serverAdapter.getRouter();
    }
};
exports.BullBoardService = BullBoardService;
exports.BullBoardService = BullBoardService = __decorate([
    (0, common_2.Injectable)(),
    __param(0, (0, common_2.Inject)('VENDOR_A_QUEUE')),
    __param(1, (0, common_2.Inject)('VENDOR_B_QUEUE')),
    __param(2, (0, common_2.Inject)('POST_BOOKING_QUEUE')),
    __metadata("design:paramtypes", [bullmq_1.Queue,
        bullmq_1.Queue,
        bullmq_1.Queue])
], BullBoardService);
let BullBoardModule = class BullBoardModule {
};
exports.BullBoardModule = BullBoardModule;
exports.BullBoardModule = BullBoardModule = __decorate([
    (0, common_1.Module)({
        imports: [vendor_module_1.VendorModule],
        providers: [BullBoardService],
        exports: [BullBoardService],
    })
], BullBoardModule);
//# sourceMappingURL=bullboard.module.js.map