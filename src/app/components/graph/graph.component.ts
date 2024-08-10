import { Component } from '@angular/core';
import * as d3 from 'd3';
import { IpcService } from '../../ipc.service';
import { IpcChannels } from '../../../../backend/ipc-channels';
import { IpcMainEvent } from 'electron';
import { ComponentService } from '../../component-service';

const margin = { top: 20, right: 30, bottom: 30, left: 40 };
const width = 800 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

@Component({
  selector: 'app-graph',
  standalone: true,
  imports: [],
  templateUrl: './graph.component.html',
  styleUrl: './graph.component.scss'
})
export class GraphComponent {
  private svg: any;
  selectedComponent: string;

  constructor(private ipc: IpcService,
              private componentService: ComponentService) {
    this.componentService.fetch$.subscribe(this.onSetSelectedComponent.bind(this));
    this.selectedComponent = "";
  }

  ngOnInit() {
    this.createSvg();
    this.ipc.on(IpcChannels.GET_SW_COMPONENT_FROM_DB_OK, this.onGetSwComponentFromDbOk.bind(this));
  }

  onShowGraph(event: any) {
    if(this.selectedComponent !== "") {
      this.ipc.send(IpcChannels.GET_SW_COMPONENT_FROM_DB, this.selectedComponent);
    }
  }

  private onSetSelectedComponent(component: string) {
    this.selectedComponent = component;
  }

  private onGetSwComponentFromDbOk(event: IpcMainEvent, ...args: any[]) {
    const data = args[0].map((d: any) => ({
      date: new Date(d.date),
      size: +d.size
    }));
    this.drawGraph(data);
  }

  private createSvg() {
    this.svg = d3.select('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
  }

  private drawGraph(data: Array<{ date: Date; size: number }>) {
    // clear content
    this.svg.selectAll('*').remove();

    const tooltip = d3.select("#tooltip");

    // add x-axis
    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.date) as [Date, Date])
      .range([0, width]);
    this.svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x));

    // add y-axis
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.size) as number])
      .range([height, 0]);
    this.svg.append('g')
      .call(d3.axisLeft(y));

    // add the line
    this.svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#3b2479')
      .attr('stroke-width', 1.5)
      .attr('d', d3.line<{ date: Date; size: number }>()
        .x(d => x(d.date)!)
        .y(d => y(d.size)!)
      );

    // add the dots
    this.svg.selectAll('dot')
      .data(data)
      .enter().append('circle')
      .attr('r', 5)
      .attr('cx', (d: any) => x(d.date))
      .attr('cy', (d: any) => y(d.size))
      .attr('fill', '#3b2479')
      .style('cursor', 'pointer')
      // add tooltip on hover
      .on('mouseover', function(value: any) {
        tooltip.transition()
            .duration(200)
            .style('opacity', .9);
        tooltip.html(`Date: ${value.date.toISOString().split('T')[0]} ${value.date.toISOString().split('T')[1].substr(0,8)}<br/>Size: ${value.size}B`)
            .style('left', (d3.event.pageX + 5) + 'px')
            .style('top', (d3.event.pageY - 45) + 'px');
      })
      .on('mouseout', function() {
        tooltip.transition()
            .duration(500)
            .style('opacity', 0);
      });
  }
}
