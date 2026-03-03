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
        Schema::create('firm_holidays', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('firm_id');
            $table->foreign('firm_id')->on('firms')->references('id')
                ->onDelete('restrict')
                ->onUpdate('cascade');
            $table->string('name');
            $table->date('date');
            $table->string('comment')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('firm_holidays');
    }
};
