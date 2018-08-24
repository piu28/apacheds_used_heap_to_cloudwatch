var aws = require('aws-sdk');
aws.config.update({
    region: 'ap-south-1'
});
var cw = new aws.CloudWatch();

const {
    exec
} = require('child_process');

function used_heap() {
    exec("ps -ef | grep java | grep -v grep | awk '{print $2}'", (err, stdout, stderr) => {
        if (err) {
            console.log(err)
            return;
        }
        pid = parseInt(stdout)
        used_heap_comm = "jstat -gc " + pid + " | tail -n 1 | awk '{ print ($3 + $4 + $6 + $8 + $10) / 1024 }'"
        exec(used_heap_comm, (err, stdout, stderr) => {
            if (err) {
                console.log(err)
                return
            }
            used_heap = parseInt(stdout)
            console.log("UsedHeap:",used_heap);
            putCloudWatchMetric('LdapUsedHeap01', used_heap);
        });
    });
}

function total_heap() {
    exec("ps -ef | grep java | grep -v grep  | awk -F'Xmx' '{print $2}' | awk '{print $1}' | grep -o '[0-9]\\+[a-z]'", (err, stdout, stderr) => {
        if (err) {
            console.log(err)
            return;
        }
        total_heap = parseInt(stdout)
        console.log("##################")
        console.log("TotalHeap:",total_heap);
        putCloudWatchMetric('LdapTotalHeap01', total_heap);
    });
}

function putCloudWatchMetric(metricName, count) {
    cw.putMetricData({
        Namespace: 'ProdLdapHeapUtilization',
        MetricData: [{
            'MetricName': metricName,
            'Unit': 'Count',
            'Value': count
        }]
    }, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data); // successful response
    })
}

total_heap()
used_heap()
