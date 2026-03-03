<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('workers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('branch_id');
            $table->foreign('branch_id')->on('branches')->references('id')
                ->onDelete('restrict')
                ->onUpdate('cascade');
            $table->time('work_time');
            $table->time('end_time');
            $table->double('hour_price')->default(0);
            $table->double('fine_price')->default(0);
            $table->string('name');
            $table->string('phone')->nullable();
            $table->string('address')->nullable();
            $table->string('comment')->nullable();
            $table->string('employeeNoString')->unique()->nullable();
            $table->tinyInteger('status')->default(1);
            $table->string('telegram_id')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workers');
    }
};
