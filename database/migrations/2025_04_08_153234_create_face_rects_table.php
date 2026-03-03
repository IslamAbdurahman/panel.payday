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
        Schema::create('face_rects', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('hikvision_access_event_id');
            $table->foreign('hikvision_access_event_id')->on('hikvision_access_events')->references('id')
                ->onDelete('restrict')
                ->onUpdate('cascade');
            $table->float('height')->nullable();
            $table->float('width')->nullable();
            $table->float('x')->nullable();
            $table->float('y')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('face_rects');
    }
};
