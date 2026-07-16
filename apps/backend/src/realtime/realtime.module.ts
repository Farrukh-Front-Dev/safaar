import { Global, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventsService } from './events.service';
import { RealtimeGateway } from './websocket.gateway';

/**
 * Global real-time module.
 * Provides EventsService (inject into any service to emit events)
 * and RealtimeGateway (Socket.IO server).
 */
@Global()
@Module({
  imports: [EventEmitterModule.forRoot()],
  providers: [EventsService, RealtimeGateway],
  exports: [EventsService],
})
export class RealtimeModule {}
