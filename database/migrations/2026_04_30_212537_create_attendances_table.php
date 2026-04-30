<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('worker_id');
            $table->unsignedBigInteger('branch_id');
            $table->enum('type', ['work', 'break']);
            $table->dateTime('from_datetime');
            $table->dateTime('to_datetime')->nullable();
            $table->date('work_date');
            $table->time('work_time')->nullable();
            $table->time('end_time')->nullable();
            $table->boolean('is_night_shift')->default(false);
            $table->integer('worked_minutes')->nullable();
            $table->integer('break_minutes')->default(0);
            $table->integer('late_minutes')->default(0);
            $table->boolean('is_first_check_in')->default(false);
            $table->unsignedBigInteger('from_event_id')->nullable();
            $table->unsignedBigInteger('to_event_id')->nullable();
            $table->timestamps();

            $table->foreign('worker_id')->references('id')->on('workers')->cascadeOnDelete();
            $table->foreign('branch_id')->references('id')->on('branches')->cascadeOnDelete();
            $table->foreign('from_event_id')->references('id')->on('hikvision_access_events')->nullOnDelete();
            $table->foreign('to_event_id')->references('id')->on('hikvision_access_events')->nullOnDelete();

            $table->index(['worker_id', 'work_date']);
            $table->index(['branch_id', 'work_date']);
            $table->index(['work_date', 'type']);
            $table->index(['worker_id', 'type', 'to_datetime']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
