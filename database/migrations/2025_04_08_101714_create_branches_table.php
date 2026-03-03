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
        Schema::create('branches', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('firm_id');
            $table->foreign('firm_id')->on('firms')->references('id')
                ->onDelete('restrict')
                ->onUpdate('cascade');
            $table->string('name');
            $table->string('address')->nullable();
            $table->string('comment')->nullable();
            $table->time('work_time');
            $table->time('end_time');
            $table->double('hour_price')->default(0);
            $table->double('fine_price')->default(0);
            $table->tinyInteger('status')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('branches');
    }
};
