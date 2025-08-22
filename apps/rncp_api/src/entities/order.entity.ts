import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { OrderStatus, OrderPriority } from '@rncp/types';
import { User } from './user.entity';

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'merchant_id' })
    merchantId: number;

    @Column({ name: 'customer_name' })
    customerName: string;

    @Column({ name: 'customer_phone', nullable: true })
    customerPhone?: string;

    @Column({ name: 'delivery_address' })
    deliveryAddress: string;

    @Column({
        name: 'delivery_coordinates',
        type: 'jsonb',
        nullable: true,
    })
    deliveryCoordinates?: {
        latitude: number;
        longitude: number;
    };

    @Column({
        name: 'scheduled_delivery_time',
        type: 'timestamp',
    })
    scheduledDeliveryTime: Date;

    @Column({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.PENDING,
    })
    status: OrderStatus;

    @Column({
        type: 'enum',
        enum: OrderPriority,
        default: OrderPriority.NORMAL,
    })
    priority: OrderPriority;

    @Column({ name: 'delivery_person_id', nullable: true })
    deliveryPersonId?: number;

    @Column({ type: 'text', nullable: true })
    notes?: string;

    @Column({
        name: 'estimated_delivery_duration',
        nullable: true,
        comment: 'Estimated delivery duration in minutes',
    })
    estimatedDeliveryDuration?: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    // Relations
    @ManyToOne(() => User, { eager: false })
    @JoinColumn({ name: 'merchant_id' })
    merchant?: User;

    @ManyToOne(() => User, { eager: false })
    @JoinColumn({ name: 'delivery_person_id' })
    deliveryPerson?: User;
}
